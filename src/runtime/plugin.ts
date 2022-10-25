import Keycloak, { KeycloakProfile } from 'keycloak-js'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import {
  noAccess,
  UserAccess,
  ActiveKeycloakInstance,
  CurrentUserAccess,
  CurrentToken,
  CurrentUserInfo,
  CurrentUserProfile,
  UpdateToken
} from './composables/use-keycloak'
import { readonly, ref } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const { keycloak: options } = useRuntimeConfig().public

  if (import.meta.env.SSR) {
    // This plugin only really works on the client. If we are running SSR, bail
    // and assume that no login will happen.
    return
  }

  if (options.url === 'http://') {
    throw new Error('Please set a Keycloak URL.')
  }
  if (!options.realm || !options.clientId) {
    throw new Error('Please set a Keycloak realm and client ID.')
  }

  const keycloak = new Keycloak({
    url: options.url,
    realm: options.realm,
    clientId: options.clientId
  })
  nuxtApp.vueApp.provide(ActiveKeycloakInstance, keycloak)

  const userProfile = ref<KeycloakProfile | null>(null)
  nuxtApp.vueApp.provide(CurrentUserProfile, readonly(userProfile))

  const userInfo = ref<Record<string, any> | null>(null)
  nuxtApp.vueApp.provide(CurrentUserInfo, readonly(userInfo))

  const userAccess = ref<UserAccess>(noAccess())
  nuxtApp.vueApp.provide(CurrentUserAccess, readonly(userAccess))

  const token = ref<string | null>(null)
  nuxtApp.vueApp.provide(CurrentToken, token)

  function updateRefs () {
    userProfile.value = keycloak.profile ?? {}
    userInfo.value = keycloak.userInfo ?? {}
    userAccess.value = keycloak.tokenParsed
      ? {
          realm: keycloak.tokenParsed.realm_access,
          resources: keycloak.tokenParsed.resource_access
        }
      : noAccess()
    // Using || here to catch empty strings as well.
    token.value = keycloak.token || null
  }

  async function handleExpiredToken () {
    const loggedIn = userProfile.value !== null
    keycloak.clearToken()
    // If the user was logged in before, try to log them in again.
    if (loggedIn) {
      await keycloak.login()
    }
  }

  async function updateToken () {
    try {
      await keycloak.updateToken(120)
    } catch (e) {
      keycloak.onTokenExpired()
    }
  }
  nuxtApp.vueApp.provide(UpdateToken, updateToken)

  keycloak.onReady = updateRefs
  keycloak.onAuthSuccess = async () => {
    window.localStorage.setItem('kc-refresh-token', keycloak.refreshToken)
    await keycloak.loadUserProfile()
    await keycloak.loadUserInfo()
    updateRefs()
  }
  keycloak.onAuthLogout = () => {
    window.localStorage.removeItem('kc-refresh-token')
    updateRefs()
  }
  keycloak.onAuthRefreshSuccess = updateRefs
  keycloak.onTokenExpired = handleExpiredToken

  keycloak.init({
    ...options.initOptions,
    adapter: 'default',
    checkLoginIframe: false
  }).then(() => {
    const refreshToken = window.localStorage.getItem('kc-refresh-token')
    if (refreshToken) {
      keycloak.refreshToken = refreshToken
      keycloak.updateToken(-1)
        .then(keycloak.onAuthSuccess)
        .catch(() => {
          // Refreshing using the saved token didn't work, so bail out, pretend
          // nothing ever happened and reset to the initial state. The user will
          // have to actually call login() now.
          keycloak.refreshToken = undefined
        })
    }
  })
})
