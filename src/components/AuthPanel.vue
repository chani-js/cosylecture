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

    <div v-if="!user" class="auth-forms" id="auth-forms">
      <!-- Connexion -->
      <div>
        <h3>Connexion</h3>
        <div class="field">
          <label for="login-email">Email</label>
          <input id="login-email" v-model="loginEmail" type="email" />
        </div>
        <div class="field">
          <label for="login-password">Mot de passe</label>
          <input id="login-password" v-model="loginPassword" type="password" />
        </div>
        <button class="primary" type="button" @click="login">
          Se connecter
        </button>
      </div>

      <!-- Création de compte -->
      <div>
        <h3>Créer un compte</h3>
        <div class="field">
          <label for="signup-email">Email</label>
          <input id="signup-email" v-model="signupEmail" type="email" />
        </div>
        <div class="field">
          <label for="signup-password">Mot de passe</label>
          <input id="signup-password" v-model="signupPassword" type="password" />
        </div>
        <button class="secondary" type="button" @click="signup">
          Créer le compte
        </button>
      </div>
    </div>

    <div class="auth-status" id="auth-status">
      {{ statusMessage }}
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';

const emit = defineEmits(['user-changed']);

const user = ref(null);
const loginEmail = ref('');
const loginPassword = ref('');
const signupEmail = ref('');
const signupPassword = ref('');
const statusMessage = ref('');

let unsubscribeAuth = null;

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (u) => {
    user.value = u;
    emit('user-changed', u);
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth();
});

async function login() {
  statusMessage.value = '';
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    statusMessage.value = 'Connexion réussie ✔️';
  } catch (e) {
    statusMessage.value = 'Erreur de connexion : ' + (e.message || e.code);
  }
}

async function signup() {
  statusMessage.value = '';
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
