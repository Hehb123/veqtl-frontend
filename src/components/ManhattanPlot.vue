<template>
  <div class="coloc-plot">
    <v-chart :option="chartOption" autoresize class="chart" />
  </div>
</template>

<script>
import { computed } from 'vue'

const GWAS_COLOR = '#2f659b'
const VEQTL_COLOR = '#e8664d'
const TOP_SNP_COLOR = '#c0392b'
const AXIS_COLOR = '#273447'

const toNumber = (value) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const safeLogP = (value) => {
  const numberValue = toNumber(value)
  if (!numberValue || numberValue <= 0) return 0
  return -Math.log10(numberValue)
}

const formatMb = (value) => `${(Number(value) / 1e6).toFixed(2)} Mb`
const formatPValue = (value) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return value ?? '-'
  return numberValue < 0.001 ? numberValue.toExponential(3) : numberValue.toPrecision(4)
}

const normalizePoint = (point) => ({
  name: point.snp_id || point.SNP,
  value: [
    Number(point.position ?? point.BP),
    Number(point.neg_log_p ?? safeLogP(point.p_value ?? point.p)),
    point.snp_id || point.SNP,
    point.p_value ?? point.p,
    point.beta ?? point.b,
    point.a1 ?? point.A1,
    point.a2 ?? point.A2,
    point.freq ?? point.Freq,
    point.is_top
  ],
  raw: point
})

export default {
  name: 'ManhattanPlot',
  props: {
    trait: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const chartOption = computed(() => {
      const gwasData = (props.data?.gwas_points || [])
        .filter(point => Number.isFinite(Number(point.position ?? point.BP)))
        .map(normalizePoint)
      const veqtlData = (props.data?.veqtl_points || [])
        .filter(point => Number.isFinite(Number(point.position ?? point.BP)))
        .map(normalizePoint)

      const allPositions = [...gwasData, ...veqtlData].map(point => point.value[0])
      const region = props.data?.region
      const xMin = region?.start ?? (allPositions.length ? Math.min(...allPositions) : 0)
      const xMax = region?.end ?? (allPositions.length ? Math.max(...allPositions) : 1)
      const gwasMaxLogP = Math.max(...gwasData.map(point => point.value[1]), 1)
      const gwasYMax = Math.max(
        2,
        Math.ceil(gwasMaxLogP * 1.35 + 1)
      )
      const veqtlYMax = Math.max(
        2,
        Math.ceil(Math.max(...veqtlData.map(point => point.value[1]), 1) + 1)
      )
      const center = props.data?.center || props.trait?.topSNPBp
      const gene = props.data?.gene || props.trait?.gene || 'Gene'
      const traitName = props.data?.trait || props.trait?.trait || props.trait?.name || 'Trait'
      const chr = props.data?.chr || props.trait?.topSNPChr || ''

      const tooltipFormatter = (params) => {
        const [, , snpId, pValue, beta, a1, a2, freq] = params.value
        return [
          `<strong>${params.seriesName}</strong>`,
          `SNP: <strong>${snpId}</strong>`,
          `Position: <strong>${Math.round(params.value[0]).toLocaleString()} bp</strong>`,
          `P-value: <strong>${formatPValue(pValue)}</strong>`,
          `-log10(P): <strong>${params.value[1].toFixed(2)}</strong>`,
          beta !== undefined && beta !== null ? `Beta: <strong>${beta}</strong>` : '',
          a1 && a2 ? `Alleles: <strong>${a1}/${a2}</strong>` : '',
          freq !== undefined && freq !== null ? `Freq: <strong>${Number(freq).toPrecision(4)}</strong>` : ''
        ].filter(Boolean).join('<br/>')
      }

      const gwasTopPoint = gwasData.find(point => point.raw?.is_top)
      const gwasTopLabelY = gwasTopPoint
        ? Math.max(
            gwasMaxLogP + gwasYMax * 0.05,
            gwasYMax * 0.84
          )
        : 0
      const labelOffset = allPositions.length ? (xMax - xMin) * 0.035 : 0
      const labelLineGap = allPositions.length ? (xMax - xMin) * 0.018 : 0
      const gwasTopLabelX = gwasTopPoint
        ? Math.max(xMin, gwasTopPoint.value[0] - labelOffset)
        : 0
      const gwasTopLabelCoord = gwasTopPoint
        ? [
            gwasTopLabelX,
            Math.min(gwasYMax * 0.95, gwasTopLabelY)
          ]
        : [0, 0]
      const gwasTopLineStartCoord = gwasTopPoint
        ? [
            Math.min(gwasTopPoint.value[0], gwasTopLabelX + labelLineGap),
            gwasTopLabelCoord[1]
          ]
        : [0, 0]
      const gwasTopElbowCoord = gwasTopPoint
        ? [
            gwasTopPoint.value[0],
            gwasTopLabelCoord[1]
          ]
        : [0, 0]
      const gwasTopTargetCoord = gwasTopPoint
        ? [
            gwasTopPoint.value[0],
            gwasTopPoint.value[1] + 0.25
          ]
        : [0, 0]

      return {
        animation: false,
        title: {
          text: `${traitName} / ${gene}`,
          left: 'center',
          top: 0,
          textStyle: { color: '#2f3540', fontSize: 18, fontWeight: 700 },
        },
        tooltip: {
          trigger: 'item',
          confine: true,
          formatter: tooltipFormatter
        },
        grid: [
          { left: 78, right: 28, top: 72, height: 144 },
          { left: 78, right: 28, top: 258, height: 150 }
        ],
        xAxis: [
          {
            type: 'value',
            min: xMin,
            max: xMax,
            gridIndex: 0,
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { lineStyle: { color: AXIS_COLOR } },
            splitLine: { show: false }
          },
          {
            type: 'value',
            min: xMin,
            max: xMax,
            gridIndex: 1,
            name: chr ? `Chr ${chr}` : 'Genomic position',
            nameLocation: 'middle',
            nameGap: 34,
            axisLabel: { formatter: formatMb },
            axisLine: { lineStyle: { color: AXIS_COLOR } },
            splitLine: { show: false }
          }
        ],
        yAxis: [
          {
            type: 'value',
            gridIndex: 0,
            name: 'GWAS -log10(P)',
            nameLocation: 'middle',
            nameGap: 52,
            min: 0,
            max: gwasYMax,
            axisLine: { lineStyle: { color: AXIS_COLOR } },
            splitLine: { show: false }
          },
          {
            type: 'value',
            gridIndex: 1,
            name: 'veQTL -log10(P)',
            nameLocation: 'middle',
            nameGap: 52,
            min: 0,
            max: veqtlYMax,
            axisLine: { lineStyle: { color: AXIS_COLOR } },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: 'GWAS',
            type: 'scatter',
            xAxisIndex: 0,
            yAxisIndex: 0,
            symbol: 'circle',
            symbolSize: (value, params) => params.data?.raw?.is_top ? 9 : 5,
            data: gwasData,
            itemStyle: { color: GWAS_COLOR, opacity: 0.9 },
            emphasis: { itemStyle: { borderColor: '#111827', borderWidth: 2, opacity: 1 } }
          },
          {
            name: 'GWAS',
            type: 'scatter',
            xAxisIndex: 0,
            yAxisIndex: 0,
            symbol: 'circle',
            symbolSize: 10,
            data: gwasTopPoint ? [gwasTopPoint] : [],
            itemStyle: {
              color: GWAS_COLOR,
              borderColor: TOP_SNP_COLOR,
              borderWidth: 2,
              opacity: 1
            },
            tooltip: {
              formatter: tooltipFormatter
            },
            markPoint: gwasTopPoint
              ? {
                  symbol: 'pin',
                  symbolSize: 0.1,
                  label: {
                    show: true,
                    formatter: 'topSNP',
                    color: TOP_SNP_COLOR,
                    fontSize: 12,
                    fontWeight: 700,
                    position: 'top',
                    distance: 14
                  },
                  itemStyle: {
                    color: TOP_SNP_COLOR
                  },
                  data: [
                    {
                      coord: gwasTopPoint.value.slice(0, 2)
                    }
                  ]
                }
              : undefined,
            markLine: gwasTopPoint
              ? {
                  symbol: 'none',
                  silent: true,
                  label: {
                    show: false
                  },
                  lineStyle: {
                    color: TOP_SNP_COLOR,
                    width: 1.2
                  },
                  data: [
                    [
                      {
                        coord: gwasTopLineStartCoord,
                        label: {
                          show: true,
                          formatter: 'veQTL TopSNP',
                          position: 'start',
                          distance: [0, -14],
                          color: TOP_SNP_COLOR,
                          textBorderColor: '#fff',
                          textBorderWidth: 3,
                          fontSize: 12,
                          fontWeight: 700
                        }
                      },
                      {
                        coord: gwasTopElbowCoord
                      }
                    ]
                  ]
                }
              : undefined,
            z: 8
          },
          {
            name: 'veQTL TopSNP arrow',
            type: 'scatter',
            xAxisIndex: 0,
            yAxisIndex: 0,
            symbolSize: 0,
            data: [],
            tooltip: {
              show: false
            },
            markLine: gwasTopPoint
              ? {
                  symbol: ['none', 'arrow'],
                  silent: true,
                  label: {
                    show: false
                  },
                  lineStyle: {
                    color: TOP_SNP_COLOR,
                    width: 1.2
                  },
                  data: [
                    [
                      {
                        coord: gwasTopElbowCoord
                      },
                      {
                        coord: gwasTopTargetCoord
                      }
                    ]
                  ]
                }
              : undefined,
            z: 8
          },
          {
            name: 'veQTL',
            type: 'scatter',
            xAxisIndex: 1,
            yAxisIndex: 1,
            symbol: 'path://M0,-7 L1.6,-1.8 L7,-1.8 L2.6,1.1 L4.2,6.5 L0,3.1 L-4.2,6.5 L-2.6,1.1 L-7,-1.8 L-1.6,-1.8 Z',
            symbolSize: (value, params) => params.data?.raw?.is_top ? 10 : 6,
            data: veqtlData,
            itemStyle: { color: VEQTL_COLOR, opacity: 0.82 },
            emphasis: { itemStyle: { borderColor: '#111827', borderWidth: 2, opacity: 1 } }
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
.coloc-plot {
  width: 100%;
}

.chart {
  width: 100%;
  height: 460px;
}
</style>
