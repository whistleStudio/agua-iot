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
            title: "输入框xxx",
            width: 140,
            height: 30,
            btnWidth: 30,
            placeholder: "请输入发布内容", 
            topic: "",
            size: "medium", // small, medium, large
            hideBg: false, // 是否隐藏背景
          }                             
        },
        button: {
          tp: 0,
          name: "按钮",
          icon: "",
          width: 100,
          height: 45,
        }, 
        switch: {
          tp: 0,
          name: "开关",
          icon: ""
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
          icon: ""
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