/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/splashscreen`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/artikel` | `/artikel`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/home` | `/home`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/home/keluhan` | `/home/keluhan`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/jadwal` | `/jadwal`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/konsultasi` | `/konsultasi`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profil` | `/profil`; params?: Router.UnknownInputParams; } | { pathname: `/components/background`; params?: Router.UnknownInputParams; } | { pathname: `/constants/images`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/splashscreen`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/artikel` | `/artikel`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/home` | `/home`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/home/keluhan` | `/home/keluhan`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/jadwal` | `/jadwal`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/konsultasi` | `/konsultasi`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/profil` | `/profil`; params?: Router.UnknownOutputParams; } | { pathname: `/components/background`; params?: Router.UnknownOutputParams; } | { pathname: `/constants/images`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/splashscreen${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/artikel${`?${string}` | `#${string}` | ''}` | `/artikel${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/home${`?${string}` | `#${string}` | ''}` | `/home${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/home/keluhan${`?${string}` | `#${string}` | ''}` | `/home/keluhan${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/jadwal${`?${string}` | `#${string}` | ''}` | `/jadwal${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/konsultasi${`?${string}` | `#${string}` | ''}` | `/konsultasi${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/profil${`?${string}` | `#${string}` | ''}` | `/profil${`?${string}` | `#${string}` | ''}` | `/components/background${`?${string}` | `#${string}` | ''}` | `/constants/images${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/splashscreen`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/artikel` | `/artikel`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/home` | `/home`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/home/keluhan` | `/home/keluhan`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/jadwal` | `/jadwal`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/konsultasi` | `/konsultasi`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profil` | `/profil`; params?: Router.UnknownInputParams; } | { pathname: `/components/background`; params?: Router.UnknownInputParams; } | { pathname: `/constants/images`; params?: Router.UnknownInputParams; };
    }
  }
}
