# agua iot🐱阿瓜物联

node v20.17.0

*待解决: 1 折线图中途加线，时间对应问题*

## 20250516

baseInfo获取逻辑: renderer app -ipc- main; renderer修改bus *注意：更新时机*

## 20250526

bus changeProjInfo; canvasComponents改computed,projList关联bus.projList, activeProj和canvasComponents都是引用，可以动态更新

## 20250527

项目选择；画布中组件序列化本地存储，canvasRawComponents（bus里引用）去除components, 加载时序列化用canvasComponents接收；watch deep监听canvasComponents变化，改变canvasRawComponents后本地化；右边栏主题单选, Json.stringfy以支持a-select选项，后传bus再Json.parse

## 20250528

watch的对象要是响应式才行，改变也是要改变响应式的才有用
let obj = {} 
const a = ref(obj)
obj.attr = 1 // watch a 会变化, 因为此时a.value = obj(引用), obj变化时，可以监测到
obj = {} // 新的引用
obj.attr = 2 // watch a 无变化， 因为此时a.value = obj(原先的引用)，而obj改变的是新引用内容

## 20250530

画布里的组件用bus事件打通和属性面板的动态数据互通

## 202506032342

折线图基本OK，新增按钮、开关；发布数据迁移至总线处理；警告提示改为总线on/emit模式

## 202506042241

增加slider

## 202506062318

增加checkbox

## 202506082333

增加gauge,pie,scatter,liquidfill

## 202506092308

增加bar, stackedarea, radar

## 202506102332

增加subcommontext,sublabeltext; 
待解决问题，属性面板宽高设置，输入过程直接点击空白会报错

## 202506112313

修复组件属性面板宽高修改时点击画布不跟新或点击同种组件更新错误问题

## 202506121749

修复组件销毁引起的宽高输入框报错问题，良性报错

## 202506122221

增加背景图片、全屏功能

## 202506131859

增加主题样式选择功能

## 202506142228

增加背景深浅主题色，增加发布类组件轮廓

## 202506152237

设备页密码显示；项目页项目模式选择，项目创建后可编辑，删除时pop选项框

## 202506182335

增加主题编辑，项目和主题双击均可进行编辑模式

先本地模式服务端订阅不区分QOS，采取UI不显示测率【待解决】考虑后续全用client

连接，断开，删除项目，基本OK

## 202506192239

订阅/编辑订阅/删除订阅

## 20250622

项目修改：
配置变更远程就断开 -> 删除client(自动取消订阅) -> connected重置0；
remote 变 local -> local增加订阅；
local 变 remote -> local减少订阅

发布

## 202506232226

订阅收到消息后的分发，修正qos，部份图表数据同步问题

废掉isReading, isStart

## 20250624

chart发送消息; proj chart收发消息cache同步； 暂时去掉device检索功能

## 202506252332

增加intro页面更新提示

## 20250626

打包测试，mqtt-packet另行直接生产环境安装；为提供读写能力，resources文件加相关config文件转移至app.getPath('userData') C:\Users\用户名\AppData\Roaming\你的应用名\

*Electron 官方推荐：所有运行时生成或需要写入的数据，应该放在 app.getPath('userData') 目录下*

https://nodejs.org/api/modules.html#loading-from-node_modules-folders
Electron 在 require 时通常只去 app.asar.unpacked/node_modules/{模块} 找包，不会自动递归进 mqtt/node_modules

问题：本地订阅修改报错✔；本地主题同名；背景图片数据存储√

## 20250628

intro页面增加部分交互；main index-checkUpdate尝试多次请求更新数据；图表部分替换

更新远程服务

## 202507031713

v1.0.0版本

## 202507071722

修改device页增加客户端时的信息；修复qos retain等逻辑问题；更改local下信息显示，删除qos和retain

## 202507072112

修复本地模式下订阅显示逻辑；修复message content过长不换行问题  

