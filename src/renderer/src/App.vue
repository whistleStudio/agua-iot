<template>
  <router-view />
</template>

<script setup>
import Versions from './components/Versions.vue'
import { onMounted, ref } from 'vue'
import bus from './utils/bus'

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
const testHandle = () => {
  window.electron.ipcRenderer.invoke('r:test')
    .then((res) => {
      alert(res)
    })
    .catch((err) => {
      console.error(err)
    })

}

onMounted(() => {
  window.electron.ipcRenderer.invoke('r:getBaseInfo')
    .then((res) => {
      bus.mqttServer.port = res.port
      bus.mqttServer.localIP = res.localIP
      // 待解决:key可能会重复
      bus.devices = res.devices
      console.log("devices---", res.devices)
      bus.projList = res.projData.list
      console.log('projData---', res.projData)
    })
    .catch((err) => {
      console.error(err)
    })
})
</script>