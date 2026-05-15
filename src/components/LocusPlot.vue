<template>
  <div class="locus-plot">
    <v-chart :option="chartOption" autoresize class="chart" @click="handleChartClick" />
  </div>
</template>

<script>
import { ref, watch } from 'vue'

const safeLogP = (pValue) => {
  const value = Number(pValue)
  if (!Number.isFinite(value) || value <= 0) return 0
  return -Math.log10(value)
}

const SIGNIFICANCE_THRESHOLD = 5e-8
const SIGNIFICANCE_THRESHOLD_LOG_P = safeLogP(SIGNIFICANCE_THRESHOLD)

const formatMb = (value) => `${(Number(value) / 1e6).toFixed(2)} Mb`
const formatBp = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? `${Math.round(number).toLocaleString()} bp` : value
}
const formatPValue = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return value
  return number < 0.001 ? number.toExponential(3) : number.toPrecision(4)
}

export default {
  name: 'LocusPlot',
  emits: ['snp-click'],
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const chartOption = ref({})

    const normalizeLegacyPoint = (data) => {
      const position = String(data.position || '').includes(':')
        ? Number(String(data.position).split(':')[1]?.replaceAll(',', ''))
        : Number(data.position || data.BP || 0)

      return {
        snp_id: data.snp_id || data.SNP || 'Lead SNP',
        position,
        p_value: data.p_value || data.p || 1e-6,
        beta: data.beta || data.b,
        gene_symbol: data.gene_symbol || data.Gene,
        is_lead: true
      }
    }

    const updateChart = (data) => {
      const points = Array.isArray(data.points) && data.points.length
        ? data.points
        : [normalizeLegacyPoint(data)].filter(point => point.position)

      const chartData = points
        .filter(point => Number.isFinite(Number(point.position)))
        .map(point => ({
          value: [
            Number(point.position),
            safeLogP(point.p_value),
            point.snp_id,
            point.p_value,
            point.beta,
            point.gene_symbol,
            point.is_lead
          ],
          raw: point,
          symbolSize: 5
        }))

      const geneName = data.gene || data.gene_symbol || data.Gene || 'Gene'
      const positions = chartData.map(point => point.value[0])
      const minPosition = Math.min(...positions)
      const maxPosition = Math.max(...positions)
      const observedSpan = Math.max(1, maxPosition - minPosition)
      const padding = Math.max(1000, observedSpan * 0.05)
      const xMin = Math.floor((data.region?.start ?? minPosition - padding))
      const xMax = Math.ceil((data.region?.end ?? maxPosition + padding))
      const maxLogP = Math.max(...chartData.map(point => point.value[1]), 0)
      const yMax = Math.ceil(Math.max(maxLogP, SIGNIFICANCE_THRESHOLD_LOG_P) + 1)

      chartOption.value = {
        title: {
          text: geneName,
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 700
          }
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'cross',
            snap: true,
            label: {
              show: false
            },
            lineStyle: {
              color: '#d1d5db',
              width: 1,
              type: 'solid'
            },
            crossStyle: {
              color: '#d1d5db',
              width: 1,
              type: 'solid'
            }
          },
          formatter: (params) => {
            const [position, logP, snpId, pValue, beta, pointGene] = params.value
            return `<strong>${snpId}</strong><br/>
                    Position: <strong>${formatBp(position)}</strong><br/>
                    P-value: <strong>${formatPValue(pValue)}</strong><br/>
                    ${beta !== undefined && beta !== null ? `Beta: <strong>${beta}</strong><br/>` : ''}
                    ${pointGene ? `Gene: <strong>${pointGene}</strong>` : ''}`
          }
        },
        axisPointer: {
          show: true,
          type: 'cross',
          snap: true,
          label: {
            show: false
          },
          lineStyle: {
            color: '#d1d5db',
            width: 1,
            type: 'solid'
          },
          crossStyle: {
            color: '#d1d5db',
            width: 1,
            type: 'solid'
          }
        },
        grid: {
          left: '6%',
          right: '4%',
          bottom: '12%',
          top: '14%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          min: xMin,
          max: xMax,
          scale: true,
          boundaryGap: false,
          name: data.region ? `Chr ${data.region.chr}` : 'Position',
          nameGap: 28,
          nameLocation: 'middle',
          axisLine: {
            show: true,
            onZero: false,
            lineStyle: {
              color: '#111827',
              width: 1.2
            }
          },
          axisTick: {
            show: true,
            length: 7,
            lineStyle: {
              color: '#111827',
              width: 1.2
            }
          },
          axisLabel: {
            formatter: formatMb,
            color: '#111827'
          },
          splitLine: {
            show: false
          },
          axisPointer: {
            show: true,
            type: 'line',
            snap: true,
            label: {
              show: false
            },
            lineStyle: {
              color: '#d1d5db',
              width: 1
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '-log10(P-value)',
          nameGap: 30,
          min: 0,
          max: yMax,
          nameTextStyle: {
            color: '#111827'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#111827',
              width: 1.2
            }
          },
          axisTick: {
            show: true,
            length: 7,
            lineStyle: {
              color: '#111827',
              width: 1.2
            }
          },
          axisLabel: {
            color: '#111827'
          },
          splitLine: {
            show: false
          },
          axisPointer: {
            show: true,
            type: 'line',
            snap: true,
            label: {
              show: false
            },
            lineStyle: {
              color: '#d1d5db',
              width: 1
            }
          }
        },
        series: [
          {
            name: 'SNPs',
            type: 'scatter',
            symbol: 'circle',
            symbolSize: 5,
            symbolOffset: [0, -2],
            data: chartData,
            large: false,
            itemStyle: {
              color: '#D96245',
              opacity: 0.9
            },
            cursor: 'crosshair',
            emphasis: {
              itemStyle: {
                opacity: 1,
                color: '#D96245'
              }
            },
            markLine: {
              silent: true,
              symbol: 'none',
              label: {
                show: true,
                formatter: 'p = 5e-8',
                position: 'end',
                color: '#6b7280',
                fontSize: 12,
                fontWeight: 700
              },
              lineStyle: {
                color: '#6b7280',
                type: 'dashed',
                width: 1.2
              },
              data: [{ yAxis: SIGNIFICANCE_THRESHOLD_LOG_P }]
            }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: 0,
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
            moveOnMouseWheel: false
          }
        ]
      }
    }

    watch(() => props.data, (newData) => {
      if (newData) updateChart(newData)
    }, { immediate: true, deep: true })

    const handleChartClick = (params) => {
      if (params?.seriesType !== 'scatter' || !params.data?.raw) return
      emit('snp-click', params.data.raw)
    }

    return {
      chartOption,
      handleChartClick
    }
  }
}
</script>

<style scoped>
.locus-plot {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 560px;
}

.chart :deep(canvas) {
  cursor: crosshair !important;
}
</style>
