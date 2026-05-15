import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart, BoxplotChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, DataZoomComponent, MarkLineComponent } from 'echarts/components'

// 注册 ECharts 核心组件 (只引入需要的，减小打包体积)
use([CanvasRenderer, ScatterChart, BoxplotChart, TitleComponent, TooltipComponent, GridComponent, DataZoomComponent, MarkLineComponent])

const app = createApp(App)

app.component('v-chart', ECharts) // 全局注册 v-chart 组件
app.use(router)
app.use(ElementPlus)

app.mount('#app')
