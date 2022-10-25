import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import type { KeycloakInitOptions } from 'keycloak-js'

export interface ModuleOptions {
  /**
   * Keycloak instance to use.
   *
   * This should be the fully qualified Keycloak URL, so if your installation
   * still has the `/auth` path, include it here.
   */
  url: `http://${string}` | `https://${string}`

  /**
   * Name of the Keycloak realm.
   */
  realm: string

  /**
   * Client ID to use to authenticate.
   *
   * Make sure this client is configured to not require a secret key for
   * authentication (set "Access Type" to `public` in the Keycloak settings).
   */
  clientId: string

  /**
   * Additional init options passed when creating the Keycloak provider.
   */
  initOptions: Omit<KeycloakInitOptions, 'adapter' | 'checkLoginIframe' | 'checkLoginIframeInterval'>
}

export interface ModulePublicRuntimeConfig {
  keycloak: ModuleOptions
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'keycloak',
    configKey: 'keycloak'
  },

  defaults: {
    url: 'http://',
    realm: '',
    clientId: '',
    initOptions: {}
  },

  setup (options, nuxt) {
    // Expose the module options in the public runtime config.
    nuxt.options.runtimeConfig.public.keycloak = defu(
      nuxt.options.runtimeConfig.public.keycloak,
      options
    )

    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('./runtime/plugin'))
  }
})
