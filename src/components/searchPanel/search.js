// 达标考核
export const goalManage = [
  [
    {
      label: '时间选择',
      valueName: 'station',
      type: 'select',
      options: [
        {
          value: '2018',
          label: '2018'
        },
        {
          value: '2019',
          label: '2019'
        },
        {
          value: '2020',
          label: '2020'
        },
        {
          value: '2021',
          label: '2021'
        },
        {
          value: '2022',
          label: '2022'
        },
        {
          value: '2023',
          label: '2023'
        },
        {
          value: '2024',
          label: '2024'
        }
      ],
      defaultValue: '2023'
    },
    {
      label: '区域选择',
      labelShow: true,
      checked: true,
      valueName: 'area',
      type: 'radio',
      options: [
        {
          value: '济南市',
          label: '济南市'
        },
        {
          value: '槐荫区',
          label: '槐荫区'
        },
        {
          value: '莱芜区',
          label: '莱芜区'
        }
      ],
      defaultValue: '济南市'
    },
    {
      label: '区域选择',
      labelShow: false,
      checked: false,
      valueName: 'river',
      type: 'riverRadio',
      options: [
        {
          value: '小清河',
          label: '小清河'
        },
        {
          value: '河流1',
          label: '河流1'
        },
        {
          value: '河流1',
          label: '河流1'
        }
      ],
      defaultValue: '小清河'
    },
    {
      label: '控制级别',
      valueName: 'staType',
      type: 'checkbox',
      options: [
        {
          value: '0',
          label: '国控'
        },
        {
          value: '1',
          label: '省控'
        },
        {
          value: '2',
          label: '市控'
        }
      ],
      defaultValue: ['0', '1', '2']
    },
    {
      label: '状态选择',
      valueName: 'standard',
      type: 'checkbox',
      options: [
        {
          value: '0',
          label: '考核'
        },
        {
          value: '1',
          label: '不考核'
        }
      ],
      defaultValue: ['0', '1']
    }
  ]
]

// 自动监测数据
export const autoStandardAry = [
  [
    {
      label: '站点类型',
      valueName: 'station',
      type: 'select',
      options: [
        {
          value: '',
          label: '全部'
        },
        {
          value: '1',
          label: 'aa'
        },
        {
          value: '2',
          label: 'bb'
        }
      ],
      defaultValue: ''
    },
    {
      label: '时间类型',
      valueName: 'timeType',
      type: 'select',
      options: [
        {
          value: '0',
          label: '实时'
        },
        {
          value: '1',
          label: '月'
        }
      ],
      defaultValue: '0'
    },
    {
      label: '溯源时间',
      valueName: 'rangePicker',
      type: 'rangePicker',
      defaultValue: ['2023-04-04 13:00:00', '2023-04-05 14:00:00']
    },
    {
      label: '控制级别',
      valueName: 'staType',
      type: 'checkbox',
      options: [
        {
          value: '0',
          label: '国控'
        },
        {
          value: '1',
          label: '省控'
        },
        {
          value: '2',
          label: '市控'
        }
      ],
      defaultValue: ['0', '1']
    },
    {
      label: '达标情况',
      valueName: 'standard',
      type: 'checkbox',
      options: [
        {
          value: '0',
          label: '达标'
        },
        {
          value: '1',
          label: '超标'
        }
      ],
      defaultValue: ['0']
    }
  ],
  [
    {
      label: '区域选择',
      valueName: 'area',
      type: 'select',
      options: [
        {
          value: '济南市',
          label: '济南市'
        },
        {
          value: '槐荫区',
          label: '槐荫区'
        },
        {
          value: '莱芜区',
          label: '莱芜区'
        }
      ],
      defaultValue: '济南市'
    },
    {
      label: '行政区划',
      valueName: 'division',
      type: 'select',
      options: [
        {
          value: '济南市',
          label: '济南市'
        },
        {
          value: '槐荫区',
          label: '槐荫区'
        },
        {
          value: '莱芜区',
          label: '莱芜区'
        }
      ],
      defaultValue: '济南市'
    },
    {
      label: '断面名称',
      valueName: 'sectionName',
      type: 'select',
      mode: 'multiple',
      options: [
        {
          value: '北沙河黄河口',
          label: '北沙河黄河口'
        },
        {
          value: '槐荫区',
          label: '槐荫区'
        },
        {
          value: '莱芜区',
          label: '莱芜区'
        }
      ],
      defaultValue: ["北沙河黄河口"]
    },
    {
      label: '信息展示',
      valueName: 'information',
      type: 'select',
      options: [
        {
          value: '0',
          label: '全选'
        },
        {
          value: '槐荫区',
          label: '槐荫区'
        },
        {
          value: '莱芜区',
          label: '莱芜区'
        }
      ],
      defaultValue: '0'
    },
    {
      label: '因子选择',
      valueName: 'factor',
      type: 'select',
      options: [
        {
          value: '',
          label: '全选'
        },
        {
          value: '槐荫区',
          label: '槐荫区'
        },
        {
          value: '莱芜区',
          label: '莱芜区'
        }
      ],
      defaultValue: ''
    },
  ]
]

// 达标评价
export const standardAry = []

