# agua iot🐱阿瓜物联

node v20.17.0

## 20250516

baseInfo获取逻辑: renderer app -ipc- main; renderer修改bus *注意：更新时机*

## 20250526

bus changeProjInfo; canvasComponents改computed,projList关联bus.projList, activeProj和canvasComponents都是引用，可以动态更新

## 20250527

项目选择；画布中组件序列化本地存储，canvasRawComponents（bus里引用）去除components, 加载时序列化用canvasComponents接收；watch deep监听canvasComponents变化，改变canvasRawComponents后本地化；右边栏主题单选, Json.stringfy以支持a-select选项，后传bus再Json.parse