<template>
  <img alt="logo" class="logo" src="../assets/electron.svg" @click="$router.push('/home')"/>
  <p>AGUA-IOT</p>
  <p class="netInfo"><span></span>:<span></span></p>
</template>


<script setup>
import { onMounted, ref, reactive } from 'vue'
import bus from '../utils/bus'

/* -------------- */
onMounted(() => {
  setTimeout(() => { // wait bus update
    document.querySelector('.netInfo').children[0].innerText = bus.mqttServer.localIP
    document.querySelector('.netInfo').children[1].innerText = bus.mqttServer.port
  }, 200)
})

</script>


<style scoped>
.logo {
  cursor: pointer;
}

</style>
