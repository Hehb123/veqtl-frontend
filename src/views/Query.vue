<template>
  <div class="query-container">
    <section class="tool-hero">
      <h1>Search SNP-Gene Pairs</h1>
    </section>

    <el-card class="search-card">
      <div class="primary-search">
        <el-input
          v-model="queryText"
          placeholder='Enter SNP ID and gene symbol, e.g. "rs62068366,CDK10"'
          clearable
          size="large"
          @keyup.enter="runSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" size="large" :loading="loading" @click="runSearch">
          Search
        </el-button>
        <el-button size="large" @click="fillExamplePair">
          Example
        </el-button>
      </div>
    </el-card>

    <el-card class="matrix-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">Tissue Presence Heatmap</span>
        </div>
      </template>

      <div v-if="queryPairs.length" class="matrix-scroll">
        <div class="presence-matrix" :style="{ '--tissue-count': visibleTissues.length }">
          <div class="matrix-corner">
            <span class="heatmap-legend-label">-log10(p)</span>
            <span class="heatmap-legend-bar" />
            <span class="heatmap-legend-scale">
              <small>low</small>
              <small>high</small>
            </span>
          </div>
          <div
            v-for="tissue in visibleTissues"
            :key="tissue.value"
            class="matrix-tissue"
            :title="tissue.label"
          >
            {{ tissue.shortLabel }}
          </div>

          <template v-for="pair in queryPairs" :key="pair.key">
            <button class="matrix-pair" type="button" @click="selectPair(pair)">
              <strong>{{ pair.snp }}</strong>
              <span>{{ pair.gene }}</span>
            </button>
            <button
              v-for="tissue in visibleTissues"
              :key="`${pair.key}-${tissue.value}`"
              class="matrix-cell"
              :class="{
                present: cellFor(pair.key, tissue.value),
                selected: selectedPairKey === pair.key && selectedTissue === tissue.value
              }"
              type="button"
              :title="cellTitle(pair.key, tissue)"
              :style="cellStyle(pair.key, tissue.value)"
              @click="selectCell(pair, tissue.value)"
            />
          </template>
        </div>
      </div>

      <el-empty
        v-else
        :description="emptyText"
        class="query-empty"
      />
    </el-card>

    <el-card class="results-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ detailTitle }}</span>
          <el-tag v-if="selectedRecords.length" type="info" effect="plain">
            {{ selectedRecords.length }} records
          </el-tag>
        </div>
      </template>

      <el-table v-if="selectedRecords.length" :data="selectedRecords" stripe height="420">
        <el-table-column prop="snp_id" label="SNP" min-width="140" />
        <el-table-column prop="gene_symbol" label="eGene" min-width="130" />
        <el-table-column prop="tissue" label="Tissue" min-width="220" show-overflow-tooltip />
        <el-table-column prop="chr" label="Chr" width="90" />
        <el-table-column label="Position" min-width="130">
          <template #default="scope">{{ formatPosition(scope.row.position) }}</template>
        </el-table-column>
        <el-table-column prop="beta" label="Beta" width="120" />
        <el-table-column label="P-value" min-width="150">
          <template #default="scope">{{ formatPValue(scope.row.p_value) }}</template>
        </el-table-column>
        <el-table-column label="Action" width="110" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="viewExpressionPlot(scope.row)">Plot</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-else
        description="Select a tissue cell to view association records."
        class="detail-empty"
      />
    </el-card>

    <el-dialog
      v-model="showExpressionPlot"
      :title="expressionDialogTitle"
      width="760px"
      top="12vh"
      class="expression-dialog"
    >
      <ExpressionGenotypePlot
        v-if="expressionEffect?.data?.length"
        v-loading="expressionLoading"
        :data="expressionEffect"
      />
      <el-empty
        v-else
        v-loading="expressionLoading"
        :description="expressionEmptyText"
        class="expression-empty compact"
      />
    </el-dialog>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import ExpressionGenotypePlot from '../components/ExpressionGenotypePlot.vue'
import { fetchGenotypeEffect, queryPair } from '../api'
import { makeQueryPairCacheKey, queryPairCache } from '../cache'

const TISSUES = [
  'Adipose_Subcutaneous',
  'Adipose_Visceral_Omentum',
  'Adrenal_Gland',
  'Artery_Aorta',
  'Artery_Coronary',
  'Artery_Tibial',
  'Bladder',
  'Brain_Amygdala',
  'Brain_Anterior_cingulate_cortex_BA24',
  'Brain_Caudate_basal_ganglia',
  'Brain_Cerebellar_Hemisphere',
  'Brain_Cerebellum',
  'Brain_Cortex',
  'Brain_Frontal_Cortex_BA9',
  'Brain_Hippocampus',
  'Brain_Hypothalamus',
  'Brain_Nucleus_accumbens_basal_ganglia',
  'Brain_Putamen_basal_ganglia',
  'Brain_Spinal_cord_cervical_c-1',
  'Brain_Substantia_nigra',
  'Breast_Mammary_Tissue',
  'Cells_Cultured_fibroblasts',
  'Cells_EBV-transformed_lymphocytes',
  'Colon_Sigmoid',
  'Colon_Transverse',
  'Esophagus_Gastroesophageal_Junction',
  'Esophagus_Mucosa',
  'Esophagus_Muscularis',
  'Heart_Atrial_Appendage',
  'Heart_Left_Ventricle',
  'Kidney_Cortex',
  'Liver',
  'Lung',
  'Minor_Salivary_Gland',
  'Muscle_Skeletal',
  'Nerve_Tibial',
  'Ovary',
  'Pancreas',
  'Pituitary',
  'Prostate',
  'Skin_Not_Sun_Exposed_Suprapubic',
  'Skin_Sun_Exposed_Lower_leg',
  'Small_Intestine_Terminal_Ileum',
  'Spleen',
  'Stomach',
  'Testis',
  'Thyroid',
  'Uterus',
  'Vagina',
  'Whole_Blood'
]

const formatTissueLabel = (value) => value.replace(/_/g, ' ')
const normalizeTissueValue = (value) => String(value || '').replace(/\\/g, '/').split('/').pop().replace(/\.parquet$/i, '')
const pairKey = (snp, gene) => `${snp.toLowerCase()}__${gene.toUpperCase()}`

export default {
  name: 'Query',
  components: {
    ExpressionGenotypePlot,
    Search
  },
  setup() {
    const queryText = ref('')
    const loading = ref(false)
    const searchPerformed = ref(false)
    const results = ref([])
    const queryPairs = ref([])
    const selectedPairKey = ref('')
    const selectedTissue = ref('')
    const showExpressionPlot = ref(false)
    const selectedExpressionRow = ref(null)
    const expressionLoading = ref(false)
    const expressionEffect = ref(null)
    const expressionError = ref('')

    const queryLimit = 5000
    const examplePair = 'rs62068366,CDK10'

    const tissues = TISSUES.map((value) => ({
      label: formatTissueLabel(value),
      shortLabel: formatTissueLabel(value)
        .replace(/\b(Adipose|Artery|Brain|Cells|Esophagus|Heart|Skin)\b/g, '')
        .trim()
        .slice(0, 18),
      value
    }))

    const visibleTissues = computed(() => tissues)

    const emptyText = computed(() => {
      if (!searchPerformed.value) return 'Search a SNP-Gene pair to view tissue presence.'
      return 'No tissue-level association found for the current pair.'
    })

    const resultByPairAndTissue = computed(() => {
      const map = new Map()
      for (const row of results.value) {
        const key = `${row.pairKey}__${row.tissue}`
        const current = map.get(key)
        if (!current || Number(row.p_value) < Number(current.p_value)) {
          map.set(key, row)
        }
      }
      return map
    })

    const presentTissueCount = computed(() => {
      const tissuesWithRecords = new Set(results.value.map((row) => row.tissue))
      return tissuesWithRecords.size
    })

    const selectedRecords = computed(() => {
      if (!selectedPairKey.value) return []
      return results.value.filter((row) => {
        const pairMatches = row.pairKey === selectedPairKey.value
        const tissueMatches = selectedTissue.value ? row.tissue === selectedTissue.value : true
        return pairMatches && tissueMatches
      })
    })

    const detailTitle = computed(() => {
      const pair = queryPairs.value.find((item) => item.key === selectedPairKey.value)
      if (!pair) return 'Association Details'
      const tissue = tissues.find((item) => item.value === selectedTissue.value)
      return tissue ? `${pair.snp} - ${pair.gene} in ${tissue.label}` : `${pair.snp} - ${pair.gene}`
    })

    const expressionEmptyText = computed(() => {
      if (!selectedExpressionRow.value) {
        return 'Select a record to view expression by genotype.'
      }
      return expressionError.value || 'No matched expression-genotype samples found.'
    })

    const expressionDialogTitle = computed(() => {
      const row = selectedExpressionRow.value
      if (!row) return 'Expression by Genotype'
      const tissue = formatTissueLabel(row.tissue || '')
      return `${row.snp_id} - ${row.gene_symbol}${tissue ? ` in ${tissue}` : ''}`
    })

    const parseQueryPairs = () => {
      const groups = queryText.value
        .split(/[;\n]+/)
        .map((group) => group.trim())
        .filter(Boolean)

      const pairs = []
      for (const group of groups) {
        const terms = group.split(/[,\s]+/).map((term) => term.trim()).filter(Boolean)
        const snp = terms.find((term) => /^rs\d+/i.test(term))
        const gene = terms.find((term) => !/^rs\d+/i.test(term))
        if (snp && gene) {
          pairs.push({ snp, gene, key: pairKey(snp, gene) })
        }
      }

      return Array.from(new Map(pairs.map((pair) => [pair.key, pair])).values())
    }

    const runSearch = async () => {
      const pairs = parseQueryPairs()
      if (!pairs.length) {
        ElMessage.warning(`Please enter SNP ID and gene symbol, for example ${examplePair}`)
        return
      }

      loading.value = true
      searchPerformed.value = true
      queryPairs.value = pairs
      selectedPairKey.value = ''
      selectedTissue.value = ''

      try {
        const responses = await Promise.all(
          pairs.map(async (pair) => {
            const cacheKey = makeQueryPairCacheKey({
              snp: pair.snp,
              gene: pair.gene,
              limit: queryLimit
            })
            if (queryPairCache.has(cacheKey)) {
              return queryPairCache.get(cacheKey)
            }

            const response = await queryPair({
              snp_id: pair.snp,
              gene_symbol: pair.gene,
              limit: queryLimit
            })
            const rows = response.data.results || []
            const normalizedRows = rows.map((row) => ({
              ...row,
              tissue: normalizeTissueValue(row.tissue),
              pairKey: pair.key,
              queryPair: `${pair.snp} - ${pair.gene}`
            }))
            queryPairCache.set(cacheKey, normalizedRows)
            return normalizedRows
          })
        )

        results.value = responses.flat()
        if (pairs.length) {
          selectedPairKey.value = pairs[0].key
        }
        if (!results.value.length) {
          ElMessage.info('No records found')
        }
      } catch (error) {
        console.error('Query failed:', error)
        ElMessage.error(error.message || 'Query failed')
      } finally {
        loading.value = false
      }
    }

    const cellFor = (pair, tissue) => resultByPairAndTissue.value.get(`${pair}__${tissue}`)

    const fillExamplePair = () => {
      queryText.value = examplePair
    }

    const selectPair = (pair) => {
      selectedPairKey.value = pair.key
      selectedTissue.value = ''
    }

    const selectCell = (pair, tissue) => {
      selectedPairKey.value = pair.key
      selectedTissue.value = tissue
    }

    const cellTitle = (pair, tissue) => {
      const row = cellFor(pair, tissue.value)
      if (!row) return `${tissue.label}: no association`
      return `${tissue.label}: p=${formatPValue(row.p_value)}, beta=${row.beta}`
    }

    const cellStyle = (pair, tissue) => {
      const row = cellFor(pair, tissue)
      const pValue = Number(row?.p_value)
      if (!Number.isFinite(pValue) || pValue <= 0) return {}

      const score = Math.min(-Math.log10(pValue), 20)
      const intensity = Math.max(0.18, score / 20)
      return {
        backgroundColor: `rgba(217, 98, 69, ${intensity})`
      }
    }

    const formatPValue = (value) => {
      if (value === null || value === undefined || value === '') return '-'
      const numberValue = Number(value)
      return Number.isFinite(numberValue) ? numberValue.toExponential(3) : value
    }

    const formatPosition = (value) => {
      if (value === null || value === undefined || value === '') return '-'
      const numberValue = Number(value)
      return Number.isFinite(numberValue) ? numberValue.toLocaleString() : value
    }

    const viewExpressionPlot = async (row) => {
      selectedExpressionRow.value = row
      showExpressionPlot.value = true
      expressionEffect.value = null
      expressionLoading.value = true
      expressionError.value = ''
      try {
        const response = await fetchGenotypeEffect({
          snp: row.snp_id,
          gene: row.gene_symbol,
          tissue: row.tissue
        })
        expressionEffect.value = response.data
      } catch (error) {
        console.error('Expression genotype effect failed:', error)
        expressionEffect.value = null
        expressionError.value = error.message || 'Expression genotype effect failed.'
      } finally {
        expressionLoading.value = false
      }
    }

    return {
      queryText,
      tissues,
      visibleTissues,
      loading,
      searchPerformed,
      results,
      queryPairs,
      selectedPairKey,
      selectedTissue,
      presentTissueCount,
      selectedRecords,
      detailTitle,
      emptyText,
      showExpressionPlot,
      selectedExpressionRow,
      expressionLoading,
      expressionEffect,
      expressionEmptyText,
      expressionDialogTitle,
      runSearch,
      fillExamplePair,
      cellFor,
      selectPair,
      selectCell,
      cellTitle,
      cellStyle,
      formatPValue,
      formatPosition,
      viewExpressionPlot
    }
  }
}
</script>

<style scoped>
.query-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(calc(100% - 48px), 1400px);
  margin: 0 auto;
  padding: 24px 0;
}

.search-card,
.matrix-card,
.results-card {
  border-color: #dce6f3;
  background: var(--surface);
}

.search-card {
  background:
    radial-gradient(circle at 0 0, rgba(37, 99, 235, 0.08), transparent 28%),
    #fff;
}

.primary-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px 112px;
  gap: 12px;
}

.matrix-card,
.results-card {
  min-width: 0;
  min-height: 260px;
}

.matrix-card {
  margin-top: 2px;
}

.matrix-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
}

.presence-matrix {
  display: grid;
  grid-template-columns: 180px repeat(var(--tissue-count), 42px);
  min-width: max-content;
  border: 1px solid #d9e4f1;
  border-radius: 10px;
  overflow: hidden;
}

.matrix-corner,
.matrix-tissue,
.matrix-pair,
.matrix-cell {
  min-height: 42px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.matrix-corner,
.matrix-tissue {
  display: flex;
  align-items: center;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.matrix-corner {
  align-items: stretch;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: #f7fbff;
}

.heatmap-legend-label {
  color: var(--text-strong);
  font-size: 12px;
  font-weight: 700;
}

.heatmap-legend-bar {
  display: block;
  width: 100%;
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(217, 98, 69, 0.18), rgba(217, 98, 69, 1));
}

.heatmap-legend-scale {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 10px;
  line-height: 1;
}

.matrix-tissue {
  justify-content: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  height: 118px;
  padding: 8px 0;
  text-align: center;
  background: #f7fbff;
}

.matrix-pair {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  color: var(--text-strong);
  text-align: left;
  cursor: pointer;
}

.matrix-pair span {
  color: var(--muted);
  font-size: 12px;
}

.matrix-cell {
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.16s ease, box-shadow 0.16s ease;
}

.matrix-cell.present:hover,
.matrix-cell.selected {
  box-shadow: inset 0 0 0 2px rgba(17, 24, 39, 0.35);
}

.query-empty,
.expression-empty,
.detail-empty {
  min-height: 260px;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: var(--surface-soft);
}

.expression-empty.compact {
  min-height: 320px;
}

:deep(.expression-dialog .el-dialog__body) {
  padding-top: 10px;
}

@media (max-width: 860px) {
  .query-container {
    width: min(calc(100% - 32px), 1400px);
    padding: 16px 0;
  }

  .primary-search {
    grid-template-columns: 1fr;
  }
}
</style>
