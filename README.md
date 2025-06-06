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