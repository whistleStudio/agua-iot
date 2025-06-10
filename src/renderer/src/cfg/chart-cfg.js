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
            title: "输入框",
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
          icon: "",
          props: {
            title: "滑动条",
            topic: {},
            size: "medium", // small, medium, large
            min: 0,
            max: 100,
            step: 1,
            vertical: false, // 是否垂直
            hideBg: false, // 是否隐藏背景
          }
        },
        radio: {
          tp: 0,
          name: "单选框",
          icon: "",
          props: {
            title: "单选框",
            topic: {},
            size: "medium", // small, medium, large
            options: [
              { label: "选项1", value: "内容1" },
              { label: "选项2", value: "内容2" }
            ],
            showType: "default", // default, button
            hideBg: false // 是否隐藏背景
          }
        },
        checkbox: {
          tp: 0,
          name: "复选框",
          icon: "",
          props: {
            title: "复选框",
            topic: {},
            size: "medium", // small, medium, large
            options: [
              { label: "选项1", value: "内容1" },
              { label: "选项2", value: "内容2" }
            ],
            hideBg: false // 是否隐藏背景            
          }
        }
      }
    },
    subComponents: {
      name: "订阅类组件",
      parts: {
        subcommontext: {
          tp: 1,
          name: "普通文本显示",
          icon: "",
          props: {
            title: "普通文本显示",
            topic: {},
            width: 300,
            height: 60,
            value: ""
          }
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
          icon: "",
          props: {
            title: "仪表盘",
            topic: {},
            width: 300,
            height: 250,
            hideBg: false,
            min: 0,
            max: 100,
            unit: "",
            isInit: true, // 数据是否为初始状态
            value: 0,
          }
        },
        pie: {
          tp: 1,
          name: "饼状图",
          icon: "",
          props: {
            title: "饼状图",
            topic: {},
            width: 420,
            height: 280,
            hideBg: false,
            isInit: true,
            data: [
              { name: "分块1", color: "#a9c5e8", value: 20 },
              { name: "分块2", color: "#b7e8c5", value: 30 },
              { name: "分块3", color: "#f7e3b5", value: 50 }
            ]
          }
        },
        scatter: {
          tp: 1,
          name: "散点图",
          icon: "",
          props: {
            title: "散点图",
            topic: {},
            width: 450,
            height: 300,
            hideBg: false,
            count: 10,
            maxPoints: 100,
            xUnit: "",
            yUnit: "",
            scatterColor: "#37a2da",
            isInit: true,
            value: []
          }
        },
        liquidfill: {
          tp: 1,
          name: "水波图",
          icon: "",
          props: {
            title: "水波图",
            topic: {},
            width: 200,
            height: 200,
            hideBg: false,
            colorMain: '#4caafe',
            total: 100,
            value: 0
          }
        },
        bar: {
          tp: 1,
          name: "柱状图",
          icon: "",
          props: {
            title: "柱状图",
            topic: {},
            width: 420,
            height: 280,
            hideBg: false, // 是否隐藏背景
            yUnit: "单位", // Y轴单位
            count: 10,
            isInit: true, // 数据是否为初始状态
            categories: [
              { name: "类目1", color: "#4caafe", logs: [] }
            ],
            time: []
          }
        },
        stackedarea: {
          tp: 1,
          name: "堆叠面积图",
          icon: "",
          props: {
            title: "堆叠面积图",
            topic: {},
            width: 420,
            height: 280,
            hideBg: false,
            yUnit: "单位",
            count: 10,
            isInit: true,
            categories: [
              { name: "类目1", color: "#a9c5e8", logs: [] }
            ],
            time: []
          }
        },
        radar: {
          tp: 1,
          name: "雷达图",
          icon: "",
          props: {
            title: "雷达图",
            topic: {},
            width: 400,
            height: 250,
            hideBg: false,
            isInit: true,
            // 每个类目可配置最大值
            categories: [
              { name: "类目1", max: 100 },
              { name: "类目2", max: 100 },
              { name: "类目3", max: 100 }
            ]
          }
        },
      }
    },  
  }
}