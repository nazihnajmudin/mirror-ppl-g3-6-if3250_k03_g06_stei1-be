// Ini SSO Basenya belum fix
export const ssoConfig = {
  baseURL: process.env.SSO_BASE_URL || 'https://sso.itb.ac.id',
  authorizationURL: `${process.env.SSO_BASE_URL || 'https://sso.itb.ac.id'}/oauth/authorize`,
  tokenURL: `${process.env.SSO_BASE_URL || 'https://sso.itb.ac.id'}/oauth/token`,
  profileURL: `${process.env.SSO_BASE_URL || 'https://sso.itb.ac.id'}/oauth/profile`,
  clientID: process.env.SSO_CLIENT_ID || '',
  clientSecret: process.env.SSO_CLIENT_SECRET || '',
  callbackURL: process.env.SSO_CALLBACK_URL || 'http://localhost:8000/api/auth/callback',
};

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
};
