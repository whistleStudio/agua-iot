# Proj

- ① remote mode，connect ✔
params: projId, clientInfo, subTopics（full）

- ② disconnect: ✔
params: projId, clientId

- ③ changeProj: ✔
proj.isConnected = 0
params: projId, clientInfo, subTopics（full）
local -> remote

- ④ modifySubscription ✔
modify check topic if already exists
remote isConnected：add (projId, newTopic, mode) mode - 0删除/1增加/2修改

- ⑤ publish ✔
remote isConnected：pub

- ⑥ monitor topic
remote isConnected

remote !isConnected disable addSub/publish/monitor

- ⑦ delete proj (projId) ✔

- ⑧ delete sub ✔

# main index

- ① ipcMain handle connectRemoteClient ✔

- ② ipcMain handle disconnectRemoteClient ✔

- ③ ipcMain handle changeProj ✔
local -> disconnectRemoteClient, subscribeLocal
remote -> unsubscribeLocal; 

- ④ ipcMain handle modifySubscription ✔

- ⑤ ipcMain handle pub ✔

- ⑦ ✔
 # mqttClient

 - ① connectRemoteClient ✔
onSuccess: changes clientGroup {projId: clientObj}, subscribe
onErr: [disconnectHandle]remove clientObj, clientId & event
onMsg: send to renderer

- ② disconnectRemoteClient ✔
[disconnectHandle]remove clientObj, clientId & event

- ④ modifySubscription ✔

- ⑤ ✔

- ⑦ ✔


client异常时断开页面同步 ✔
切换proj,chart, actproj保持✔

更新服务远程部署