import Keycloak, { KeycloakProfile, KeycloakLoginOptions, KeycloakLogoutOptions, KeycloakRoles, KeycloakResourceAccess } from 'keycloak-js'
import type { DeepReadonly, InjectionKey, Ref } from 'vue'
import { readonly, ref, inject } from '#imports'

export interface UserAccess {
  realm: KeycloakRoles
  resources: KeycloakResourceAccess
}
export const noAccess = (): UserAccess => ({
  realm: { roles: [] },
  resources: {}
})

export const ActiveKeycloakInstance: InjectionKey<Keycloak | null> = Symbol('active-keycloak-instance')
export const CurrentUserProfile: InjectionKey<DeepReadonly<Ref<KeycloakProfile>>> = Symbol('current-user-profile')
export const CurrentUserInfo: InjectionKey<DeepReadonly<Ref<Record<string, any>>>> = Symbol('current-user-info')
export const CurrentUserAccess: InjectionKey<DeepReadonly<Ref<UserAccess>>> = Symbol('current-access')
export const CurrentToken: InjectionKey<Ref<Readonly<string | null>>> = Symbol('current-token')
export const UpdateToken: InjectionKey<() => Promise<void>> = Symbol('refresh-keycloak-token')

export interface UseKeycloakReturn {
  /**
   * The currently active keycloak instance.
   */
  keycloak: Keycloak | null

  /**
   * If a user is logged in, this ref contains their profile information, as
   * received from the server. If not, this is `null`. It will also be `null`
   * while running SSR.
   */
  userProfile: DeepReadonly<Ref<KeycloakProfile | null>>

  /**
   * OIDC user info object. When no user is logged in, this will be an empty
   * object.
   */
  userInfo: DeepReadonly<Ref<Record<string, any>>>

  /**
   * User authorization information.
   */
  userAccess: DeepReadonly<Ref<UserAccess>>

  /**
   * The current token that can be used to authenticate web requests. This is
   * not the refresh token.
   */
  token: Ref<Readonly<string | null>>

  /**
   * Manually refresh the token.
   */
  updateToken: () => Promise<void>

  /**
   * Call the Keycloak login flow. This will probably redirect the page to the
   * authentication server.
   */
  login: (options?: KeycloakLoginOptions) => Promise<void>

  /**
   * Call the Keycloak logout flow.
   */
  logout: (options?: KeycloakLogoutOptions) => Promise<void>
}

export default function useKeycloak (): UseKeycloakReturn {
  const blankPromise = () => new Promise<void>(resolve => resolve())

  const keycloak = inject(ActiveKeycloakInstance, null)

  const userProfile = inject(CurrentUserProfile, readonly(ref({})))
  const userInfo = inject(CurrentUserInfo, readonly(ref({})))
  const userAccess = inject(CurrentUserAccess, readonly(ref(noAccess())))
  const token = inject(CurrentToken, readonly(ref(null)))

  const updateToken = inject(UpdateToken, blankPromise)
  const login = keycloak?.login ?? blankPromise
  const logout = keycloak?.logout ?? blankPromise

  return { keycloak, userProfile, userInfo, userAccess, token, updateToken, login, logout }
}
