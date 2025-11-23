<!-- src/components/AuthPanel.vue -->
<template>
  <section class="panel auth-panel">
    <div class="panel-title">🔐 Connexion / Inscription</div>

    <div class="auth-top">
      <div class="user-info">
        <template v-if="user">
          Bienvenue, <strong>{{ user.email }}</strong>
        </template>
        <template v-else>
          Non connecté.
        </template>
      </div>

      <button
        v-if="user"
        class="secondary"
        type="button"
        @click="logout"
      >
        Se déconnecter
      </button>
    </div>

    <div v-if="!user" class="auth-forms">
      <div>
        <h3 class="auth-title">Connexion</h3>
        <div class="field">
          <label for="login-email">Email</label>
          <input id="login-email" type="email" v-model="loginEmail" />
        </div>
        <div class="field">
          <label for="login-password">Mot de passe</label>
          <input id="login-password" type="password" v-model="loginPassword" />
        </div>
        <button
          class="primary"
          type="button"
          @click="login"
          style="margin-top: 8px"
        >
          Se connecter
        </button>
      </div>

      <div>
        <h3 class="auth-title">Créer un compte</h3>
        <div class="field">
          <label for="signup-email">Email</label>
          <input id="signup-email" type="email" v-model="signupEmail" />
        </div>
        <div class="field">
          <label for="signup-password">Mot de passe</label>
          <input id="signup-password" type="password" v-model="signupPassword" />
        </div>
        <button
          class="secondary"
          type="button"
          @click="signup"
          style="margin-top: 8px"
        >
          Créer le compte
        </button>
      </div>
    </div>

    <div class="auth-status">
      {{ statusMessage }}
    </div>
  </section>
</template>

<script setup>
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { onMounted, ref } from 'vue';
import { auth } from '../services/firebase.js';

const emit = defineEmits(['user-changed']);

const user = ref(null);
const loginEmail = ref('');
const loginPassword = ref('');
const signupEmail = ref('');
const signupPassword = ref('');
const statusMessage = ref('');

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    user.value = u;
    emit('user-changed', u);
  });
});

async function login() {
  statusMessage.value = '';
  if (!loginEmail.value || !loginPassword.value) {
    statusMessage.value = 'Merci de remplir email et mot de passe.';
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    statusMessage.value = 'Connexion réussie ✔️';
  } catch (e) {
    statusMessage.value = 'Erreur de connexion : ' + (e.message || e.code);
  }
}

async function signup() {
  statusMessage.value = '';
  if (!signupEmail.value || !signupPassword.value) {
    statusMessage.value = 'Merci de remplir email et mot de passe.';
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value);
    statusMessage.value = 'Compte créé et connecté ✔️';
  } catch (e) {
    statusMessage.value = 'Erreur de création : ' + (e.message || e.code);
  }
}

async function logout() {
  statusMessage.value = '';
  await signOut(auth);
}
</script>
