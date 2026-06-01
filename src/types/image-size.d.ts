declare module 'image-size' {
  const sizeOf: (input: Buffer | string) => { width?: number; height?: number; type?: string };
  export default sizeOf;
}