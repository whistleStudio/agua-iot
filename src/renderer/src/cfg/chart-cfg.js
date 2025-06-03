export default {
  // tp - 0发布; 1订阅; 2装饰
  menu: {
    pubComponents: {
      name: "发布类组件",
      parts: {
        pubtext: {
          tp: 0,
          name: "输入框",
          icon: "",
          props: {
            title: "请输入标题",
            topic: {},
            size: "medium", // small, medium, large
            hideBg: false, // 是否隐藏背景
          }                             
        },
        button: {
          tp: 0,
          name: "按钮",
          icon: "",
          props: {
            title: "按钮",
            topic: {},
            size: "medium", // small, medium, large
            btnText: "按钮",
            payload: "喵~",
            hideBg: false, // 是否隐藏背景
          }
        }, 
        switch: {
          tp: 0,
          name: "开关",
          icon: "",
          props: {
            title: "开关",
            topic: {},
            size: "medium", // small, medium, large
            onText: "ON",
            offText: "OFF",
            onPayload: "on",
            offPayload: "off",
            hideBg: false, // 是否隐藏背景
          }
        },
        slider: {
          tp: 0,
          name: "滑动条",
          icon: ""
        },
        radio: {
          tp: 0,
          name: "单选框",
          icon: ""
        },
        checkbox: {
          tp: 0,
          name: "复选框",
          icon: ""
        }
      }
    },
    subComponents: {
      name: "订阅类组件",
      parts: {
        subcommontext: {
          tp: 1,
          name: "普通文本显示",
          icon: ""
        },
        sublabeltext: {
          tp: 1,
          name: "标签文本显示",
          icon: ""
        },
        linechart: {
          tp: 1,
          name: "折线图",
          icon: "",
          props:{
            title: "折线图",
            topic: {},
            width: 450,
            height: 300,
            hideBg: false, // 是否隐藏背景
            yUnit: "单位", // Y轴单位
            count: 10,
            isInit: true, // 数据是否为初始状态
            data:[{ name: "折线1", color: "#a9c5e8", logs: [] }],
            time: []
          }
        },
        gauge: {
          tp: 1,
          name: "仪表盘",
          icon: ""
        },
        pie: {
          tp: 1,
          name: "饼图",
          icon: ""
        },
        scatter: {
          tp: 1,
          name: "散点图",
          icon: ""
        },
        candlestick: {
          tp: 1,
          name: "K线图",
          icon: ""
        },
        bar: {
          tp: 1,
          name: "柱状图",
          icon: ""
        },
        stackedarea: {
          tp: 1,
          name: "堆叠面积图",
          icon: ""
        },
        radar: {
          tp: 1,
          name: "雷达图",
          icon: ""
        },
      }
    },  
  }
}