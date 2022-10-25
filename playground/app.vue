<template>
  <div>
    Nuxt module playground!
    <button @click="login">
      login
    </button>
    <button @click="logout">
      logout
    </button>
    <dl>
      <dt>User profile</dt>
      <dd>
        <pre><code>{{ prettify(userProfile) }}</code></pre>
      </dd>
      <dt>Username</dt>
      <dd>{{ username }}</dd>
      <dt>User info</dt>
      <dd>
        <pre><code>{{ prettify(userInfo) }}</code></pre>
      </dd>
      <dt>Access information</dt>
      <dd>
        <pre><code>{{ prettify(userAccess) }}</code></pre>
      </dd>
      <dt>Token</dt>
      <dd>{{ token }}</dd>
    </dl>
  </div>
</template>

<script setup lang="ts">
import useKeycloak from '../src/runtime/composables/use-keycloak'
import { computed } from '#imports'

function prettify(data: any): string {
  return JSON.stringify(data, null, 2)
}

const { userProfile, userInfo, userAccess, token, login, logout } = useKeycloak()
const username = computed(() => userProfile.value?.username ?? null)
</script>
