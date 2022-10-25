import { defineNuxtConfig } from 'nuxt/config'
import Keycloak from '..'

export default defineNuxtConfig({
  modules: [
    Keycloak
  ],

  keycloak: {
    clientId: 'nuxt-test',
    initOptions: {
      scope: 'openid email profile roles'
    }
  }
})
