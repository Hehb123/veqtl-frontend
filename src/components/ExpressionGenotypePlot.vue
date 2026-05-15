<template>
  <div class="expression-genotype-plot">
    <v-chart :option="chartOption" autoresize class="chart" />
  </div>
</template>

<script>
import { computed } from 'vue'

const quantile = (values, q) => {
  if (!values.length) return 0
  const position = (values.length - 1) * q
  const base = Math.floor(position)
  const rest = position - base
  if (values[base + 1] !== undefined) {
    return values[base] + rest * (values[base + 1] - values[base])
  }
  return values[base]
}

const formatNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(3) : '-'
}

export default {
  name: 'ExpressionGenotypePlot',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const chartOption = computed(() => {
      const rows = Array.isArray(props.data?.data) ? props.data.data : []
      const categories = ['0', '1', '2']
      const grouped = new Map(categories.map((category) => [category, []]))

      rows.forEach((row) => {
        const genotype = String(row.genotype ?? row.dosage)
        if (!grouped.has(genotype)) grouped.set(genotype, [])
        grouped.get(genotype).push(Number(row.expression))
      })

      const boxData = categories.map((category) => {
        const values = (grouped.get(category) || [])
          .filter((value) => Number.isFinite(value))
          .sort((a, b) => a - b)

        if (!values.length) return [0, 0, 0, 0, 0]
        return [
          values[0],
          quantile(values, 0.25),
          quantile(values, 0.5),
          quantile(values, 0.75),
          values[values.length - 1]
        ]
      })

      const scatterData = rows
        .filter((row) => Number.isFinite(Number(row.expression)))
        .map((row) => [
          String(row.genotype ?? row.dosage),
          Number(row.expression),
          row.iid
        ])

      const counts = props.data?.counts || {}
      const dosageLabel = props.data?.dosage_label || 'Dosage'

      return {
        color: ['#D96245'],
        animation: false,
        grid: {
          top: 30,
          right: 28,
          bottom: 72,
          left: 70,
          containLabel: true
        },
        tooltip: {
          trigger: 'item',
          confine: true,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(217, 98, 69, 0.35)',
          borderWidth: 1,
          textStyle: {
            color: '#374151',
            fontSize: 12,
            lineHeight: 18
          },
          extraCssText: 'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); border-radius: 6px;',
          formatter: (params) => {
            if (params.seriesType === 'boxplot') {
              const values = params.data || []
              return [
                `<strong>${dosageLabel}: ${params.name}</strong>`,
                `n: ${counts[params.name] || 0}`,
                `min: ${formatNumber(values[0])}`,
                `Q1: ${formatNumber(values[1])}`,
                `median: ${formatNumber(values[2])}`,
                `Q3: ${formatNumber(values[3])}`,
                `max: ${formatNumber(values[4])}`
              ].join('<br/>')
            }
            return [
              `<strong>${params.data?.[2] || 'Sample'}</strong>`,
              `${dosageLabel}: ${params.data?.[0]}`,
              `Expression: ${formatNumber(params.data?.[1])}`
            ].join('<br/>')
          }
        },
        xAxis: {
          type: 'category',
          data: categories,
          name: dosageLabel,
          nameLocation: 'middle',
          nameGap: 56,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#9ca3af'
            }
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: '#9ca3af'
            }
          },
          axisLabel: {
            formatter: (value) => `{dose|${value}}\n{count|n = ${counts[value] || 0}}`,
            rich: {
              dose: {
                color: '#374151',
                fontSize: 12,
                lineHeight: 16
              },
              count: {
                color: '#6b7280',
                fontSize: 12,
                lineHeight: 18
              }
            }
          }
        },
        yAxis: {
          type: 'value',
          name: 'Normalized expression',
          nameLocation: 'middle',
          nameGap: 52,
          scale: true,
          splitNumber: 6,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#9ca3af'
            }
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: '#9ca3af'
            }
          },
          axisLabel: {
            color: '#4b5563'
          },
          splitLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          }
        },
        series: [
          {
            name: 'Samples',
            type: 'scatter',
            data: scatterData,
            symbolSize: 4,
            itemStyle: {
              color: '#D96245',
              opacity: 0.3
            },
            z: 2
          },
          {
            name: 'Expression distribution',
            type: 'boxplot',
            data: boxData,
            boxWidth: ['34%', '54%'],
            itemStyle: {
              color: 'rgba(217, 98, 69, 0.12)',
              borderColor: '#D96245',
              borderWidth: 1.4
            },
            markLine: {
              silent: true,
              symbol: 'none',
              label: {
                show: false
              },
              lineStyle: {
                color: '#9ca3af',
                width: 1,
                type: 'dashed'
              },
              data: [{ yAxis: 0 }]
            },
            z: 4
          }
        ]
      }
    })

    return {
      chartOption
    }
  }
}
</script>

<style scoped>
.expression-genotype-plot {
  width: 100%;
  height: 360px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
