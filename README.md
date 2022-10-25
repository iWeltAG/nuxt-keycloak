# Keycloak Nuxt Module

This module exposes a wrapper around the official [Keycloak Javascript adapter](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter) to make it work together with Nuxt (3).

## Installing the Plugin

In your `nuxt.config.ts`, import the plugin like this (merge this snippet into your existing code):

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import Keycloak from 'nuxt-keycloak'

export default defineNuxtConfig({
  modules: [
    Keycloak
  ],
  
  keycloak: {
    url: 'https://accounts.example.com',
    realm: 'example',
    clientId: 'webapp'
  }
})
```

### Configuring

The `keycloak` config options takes the following options:

- **url** *(string, required)* — Full URL of the Keycloak instance, including the `/auth` path (if present).
- **realm** *(string, required)* — Name of the Keycloak realm.
- **clientId** *(string, required)* — Client ID to use. This must be a client with the *Access Type* option set to `public`.
- **initOptions** *(object)* — These options will be passed to the [`init()`](https://www.keycloak.org/docs/latest/securing_apps/index.html#methods) method of the Keycloak adapter. As an example, you can use this to set the OpenID `scope` option.

## Usage

The `useKeycloak` composable is the main entry point to the plugin.
When it is called the first time, it will start the Keycloak initialization sequence.
It returns the following properties:

- **keycloak** *(Keycloak)* — The instance of the Keycloak Javascript adapter. This will be `null` during SSR.
- **userProfile** [🤖](https://github.com/iWeltAG/nuxt-keycloak/blob/29af07180b7ac5de875ebcf8db58db8d667d078d/src/runtime/composables/use-keycloak.ts#L32) — Vue ref containing the user's profile information.
- **userProfile** [🤖](https://github.com/iWeltAG/nuxt-keycloak/blob/29af07180b7ac5de875ebcf8db58db8d667d078d/src/runtime/composables/use-keycloak.ts#38) — Vue ref containing the OIDC user info object.
- **userProfile** [🤖](https://github.com/iWeltAG/nuxt-keycloak/blob/29af07180b7ac5de875ebcf8db58db8d667d078d/src/runtime/composables/use-keycloak.ts#43) — Vue ref containing information about the user's authorization (the scopes they have access to).
- **userProfile** *(Ref<string>)* — Vue ref containing the token that can be used to authenticate API requests on the user's behalf.
- **updateToken** *(() ⇒ void)* — Call this to manually refresh the token.
- **login** [🤖](https://github.com/iWeltAG/nuxt-keycloak/blob/29af07180b7ac5de875ebcf8db58db8d667d078d/src/runtime/composables/use-keycloak.ts#60) — Call this to start the login flow.
- **logout** [🤖](https://github.com/iWeltAG/nuxt-keycloak/blob/29af07180b7ac5de875ebcf8db58db8d667d078d/src/runtime/composables/use-keycloak.ts#60) — Call this to start the logout flow.

See the linked source file for the actual TypeScript typings for those properties marked "🤖".

### Persistence

The refresh token is automatically persisted into local storage.
It will be used on page refresh to re-authenticate the user.

## License

[MIT](https://github.com/iWeltAG/nuxt-keycloak/blob/main/LICENSE)
