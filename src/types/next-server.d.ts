declare module 'next/server.js' {
  export type NextRequest = any;
  export type NextResponse = any;
}

declare module 'next/types.js' {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module 'next/navigation.js' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
}

declare module 'next/link.js' {
  const Link: any;
  export default Link;
}

declare module 'next/image.js' {
  const Image: any;
  export default Image;
}

declare module 'next/font/google.js' {
  export function Inter(options?: any): any;
  export function Noto_Sans_SC(options?: any): any;
  export function Roboto(options?: any): any;
}

declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ResolvingMetadata = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ResolvingViewport = any;
}

declare module 'next/dist/lib/metadata/types/extra-types.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Icon = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Icons = any;
}
