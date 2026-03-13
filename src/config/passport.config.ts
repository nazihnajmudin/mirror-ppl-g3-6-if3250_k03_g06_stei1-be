import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { ssoConfig, isSSOConfigured } from './sso.config';

if (isSSOConfigured) {
  passport.use(
    'sso-itb',
    new OAuth2Strategy(
      {
        authorizationURL: ssoConfig.authorizationURL,
        tokenURL: ssoConfig.tokenURL,
        clientID: ssoConfig.clientID,
        clientSecret: ssoConfig.clientSecret,
        callbackURL: ssoConfig.callbackURL,
      },
      async (
        accessToken: string,
        _refreshToken: string,
        _profile: object,
        done: (err: unknown, user?: unknown) => void
      ) => {
        try {
          const response = await fetch(ssoConfig.profileURL, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!response.ok) {
            return done(new Error(`Gagal mengambil profil SSO: ${response.status}`));
          }

          const ssoProfile = (await response.json()) as Record<string, string>;

          return done(null, {
            email: ssoProfile.email || ssoProfile.mail,
            nama: ssoProfile.name || ssoProfile.cn,
            ssoId: ssoProfile.sub || ssoProfile.id,
            accessToken,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
} else {
  console.warn('[SSO] SSO_CLIENT_ID / SSO_CLIENT_SECRET belum dikonfigurasi. Endpoint SSO dinonaktifkan.');
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as Express.User));

export default passport;
