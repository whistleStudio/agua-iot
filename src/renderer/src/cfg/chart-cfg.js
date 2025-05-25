import { booleanType } from "ant-design-vue/es/_util/type";

export default {
  // type - 0发布; 1订阅; 2装饰
  menu: {
    pubComponents: {
      name: "发布类组件",
      parts: {
        pubtext: {
          type: 0,
          name: "输入框",
          icon: "",
          props: {
            width: 140,
            height: 30,
            btnWidth: 30,
            placeholder: "请输入发布内容", 
          }                             
        },
        button: {
          type: 0,
          name: "按钮",
          icon: "",
          width: 100,
          height: 45,
        }, 
        switch: {
          type: 0,
          name: "开关",
          icon: ""
        },
        slider: {
          type: 0,
          name: "滑动条",
          icon: ""
        },
        radio: {
          type: 0,
          name: "单选框",
          icon: ""
        },
        checkbox: {
          type: 0,
          name: "复选框",
          icon: ""
        }
      }
    },
    subComponents: {
      name: "订阅类组件",
      parts: {
        subcommontext: {
          type: 1,
          name: "普通文本显示",
          icon: ""
        },
        sublabeltext: {
          type: 1,
          name: "标签文本显示",
          icon: ""
        },
        linechart: {
          type: 1,
          name: "折线图",
          icon: ""
        },
        gauge: {
          type: 1,
          name: "仪表盘",
          icon: ""
        },
        pie: {
          type: 1,
          name: "饼图",
          icon: ""
        },
        scatter: {
          type: 1,
          name: "散点图",
          icon: ""
        },
        candlestick: {
          type: 1,
          name: "K线图",
          icon: ""
        },
        bar: {
          type: 1,
          name: "柱状图",
          icon: ""
        },
        stackedarea: {
          type: 1,
          name: "堆叠面积图",
          icon: ""
        },
        radar: {
          type: 1,
          name: "雷达图",
          icon: ""
        },
      }
    },  
  }
}