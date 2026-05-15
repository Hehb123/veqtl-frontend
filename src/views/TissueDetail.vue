<template>
  <div class="tissue-detail-container">
    <section class="tool-hero">
      <h1>{{ tissueName }}</h1>
    </section>

    <el-row :gutter="14" class="tissue-stat-row">
      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-value">{{ tissueData.samples }}</div>
          <div class="stat-label">Sample Size</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-value">{{ tissueData.genes }}</div>
          <div class="stat-label">NveGenes</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-value">{{ tissueData.snps }}</div>
          <div class="stat-label">NveQTLs</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-value">{{ tissueData.veqtl }}</div>
          <div class="stat-label">Nindependent veQTLs</div>
        </div>
      </el-col>
    </el-row>

    <el-card class="vegenes-card">
      <template #header>
        <div class="card-header">
          <div class="card-heading">
            <span class="card-title">veGenes</span>
            <el-tag type="info" effect="plain">p &lt; 5e-8</el-tag>
          </div>
        </div>
      </template>
      <div class="vegenes-layout">
        <div class="vegenes-overview">
          <div class="overview-header">
            <span>Top veGenes</span>
            <small>Significant veQTLs</small>
          </div>
          <button
            v-for="gene in topGeneBars"
            :key="gene.symbol"
            class="gene-bar-row"
            type="button"
            @click="plotGeneLocus(gene.symbol)"
          >
            <span class="gene-bar-label">{{ gene.symbol }}</span>
            <span class="gene-bar-track">
              <span class="gene-bar-fill" :style="{ width: `${gene.percent}%` }" />
            </span>
            <span class="gene-bar-value">{{ gene.veqtl_count }}</span>
          </button>
        </div>

        <el-table :data="topGenes" stripe v-loading="topGenesLoading" height="420" class="vegenes-table">
          <el-table-column prop="symbol" label="Gene Symbol" min-width="145" show-overflow-tooltip />
          <el-table-column prop="chr" label="Chr" width="92" align="center" />
          <el-table-column prop="top_snp" label="top SNP" min-width="130" show-overflow-tooltip />
          <el-table-column prop="veqtl_count" label="Significant veQTLs" min-width="180" align="center" />
          <el-table-column label="Action" width="96">
            <template #default="scope">
              <div class="gene-actions">
                <el-button link type="success" @click="plotGeneLocus(scope.row.symbol)">Plot</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card class="locus-plot-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">Locus Plot</span>
          <div class="locus-search">
            <el-autocomplete
              v-model="geneLocusQuery"
              :fetch-suggestions="queryGeneSuggestions"
              placeholder="Search gene, e.g. FTO"
              clearable
              @keyup.enter="searchGeneLocus"
              @select="handleGeneSuggestionSelect"
            />
            <el-button type="primary" :loading="locusLoading" @click="searchGeneLocus">Search</el-button>
          </div>
        </div>
      </template>
      <LocusPlot v-if="selectedLocusData" :data="selectedLocusData" @snp-click="viewExpressionPlot" />
      <el-empty v-else description="Search a gene to view locus plot" />
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
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import LocusPlot from '../components/LocusPlot.vue'
import ExpressionGenotypePlot from '../components/ExpressionGenotypePlot.vue'
import { fetchGeneSuggestions, fetchGenotypeEffect, fetchLocus, fetchTopGenes } from '../api'
import { locusCache, makeLocusCacheKey, veGenesCache } from '../cache'

const tissueDataMap = {
  Adipose_Subcutaneous: { samples: 599, genes: 762, snps: 36179, veqtl: 866 },
  Adipose_Visceral_Omentum: { samples: 499, genes: 524, snps: 23908, veqtl: 570 },
  Adrenal_Gland: { samples: 253, genes: 131, snps: 2313, veqtl: 142 },
  Artery_Aorta: { samples: 409, genes: 457, snps: 20559, veqtl: 502 },
  Artery_Coronary: { samples: 223, genes: 75, snps: 1140, veqtl: 75 },
  Artery_Tibial: { samples: 573, genes: 757, snps: 46067, veqtl: 896 },
  Bladder: { samples: 69, genes: 0, snps: 0, veqtl: 0 },
  Brain_Amygdala: { samples: 167, genes: 19, snps: 181, veqtl: 23 },
  Brain_Anterior_cingulate_cortex_BA24: { samples: 212, genes: 97, snps: 4281, veqtl: 109 },
  Brain_Caudate_basal_ganglia: { samples: 266, genes: 190, snps: 3088, veqtl: 204 },
  Brain_Cerebellar_Hemisphere: { samples: 247, genes: 225, snps: 4333, veqtl: 233 },
  Brain_Cerebellum: { samples: 241, genes: 173, snps: 5513, veqtl: 171 },
  Brain_Cortex: { samples: 242, genes: 175, snps: 2804, veqtl: 193 },
  Brain_Frontal_Cortex_BA9: { samples: 238, genes: 167, snps: 2263, veqtl: 169 },
  Brain_Hippocampus: { samples: 228, genes: 94, snps: 1190, veqtl: 99 },
  Brain_Hypothalamus: { samples: 234, genes: 106, snps: 1503, veqtl: 111 },
  Brain_Nucleus_accumbens_basal_ganglia: { samples: 259, genes: 187, snps: 2675, veqtl: 201 },
  Brain_Putamen_basal_ganglia: { samples: 231, genes: 110, snps: 1450, veqtl: 115 },
  Brain_Spinal_cord_cervical_c1: { samples: 185, genes: 57, snps: 681, veqtl: 56 },
  Brain_Substantia_nigra: { samples: 165, genes: 26, snps: 254, veqtl: 26 },
  Breast_Mammary_Tissue: { samples: 440, genes: 458, snps: 17151, veqtl: 493 },
  Cells_Cultured_fibroblasts: { samples: 553, genes: 1017, snps: 54458, veqtl: 1183 },
  Cells_EBV_transformed_lymphocytes: { samples: 256, genes: 212, snps: 10065, veqtl: 232 },
  Colon_Sigmoid: { samples: 357, genes: 351, snps: 12090, veqtl: 372 },
  Colon_Transverse: { samples: 396, genes: 444, snps: 17398, veqtl: 473 },
  Esophagus_Gastroesophageal_Junction: { samples: 345, genes: 312, snps: 8318, veqtl: 348 },
  Esophagus_Mucosa: { samples: 518, genes: 625, snps: 32454, veqtl: 699 },
  Esophagus_Muscularis: { samples: 475, genes: 650, snps: 29653, veqtl: 678 },
  Heart_Atrial_Appendage: { samples: 399, genes: 315, snps: 10396, veqtl: 348 },
  Heart_Left_Ventricle: { samples: 380, genes: 241, snps: 5968, veqtl: 264 },
  Kidney_Cortex: { samples: 88, genes: 2, snps: 12, veqtl: 2 },
  Liver: { samples: 233, genes: 85, snps: 4463, veqtl: 76 },
  Lung: { samples: 515, genes: 566, snps: 29222, veqtl: 614 },
  Minor_Salivary_Gland: { samples: 145, genes: 37, snps: 372, veqtl: 43 },
  Muscle_Skeletal: { samples: 695, genes: 633, snps: 42821, veqtl: 753 },
  Nerve_Tibial: { samples: 561, genes: 1064, snps: 54575, veqtl: 1168 },
  Ovary: { samples: 160, genes: 41, snps: 691, veqtl: 40 },
  Pancreas: { samples: 296, genes: 178, snps: 3185, veqtl: 189 },
  Pituitary: { samples: 288, genes: 215, snps: 7589, veqtl: 218 },
  Prostate: { samples: 237, genes: 116, snps: 1788, veqtl: 120 },
  Skin_Not_Sun_Exposed_Suprapubic: { samples: 553, genes: 749, snps: 38484, veqtl: 824 },
  Skin_Sun_Exposed_Lower_leg: { samples: 644, genes: 894, snps: 52595, veqtl: 1028 },
  Small_Intestine_Terminal_Ileum: { samples: 165, genes: 62, snps: 656, veqtl: 62 },
  Spleen: { samples: 225, genes: 164, snps: 2590, veqtl: 160 },
  Stomach: { samples: 335, genes: 226, snps: 10450, veqtl: 222 },
  Testis: { samples: 350, genes: 616, snps: 21564, veqtl: 630 },
  Thyroid: { samples: 585, genes: 1022, snps: 59129, veqtl: 1113 },
  Uterus: { samples: 123, genes: 11, snps: 128, veqtl: 14 },
  Vagina: { samples: 146, genes: 18, snps: 306, veqtl: 20 },
  Whole_Blood: { samples: 677, genes: 822, snps: 54898, veqtl: 936 }
}

export default {
  name: 'TissueDetail',
  components: {
    LocusPlot,
    ExpressionGenotypePlot
  },
  props: {
    tissue: String
  },
  setup(props) {
    const tissueName = ref(props.tissue?.replace(/_/g, ' ') || '')
    const tissueData = ref({ samples: 0, genes: 0, snps: 0, veqtl: 0 })
    const geneLocusQuery = ref('')
    const locusWindow = ref(1000000)
    const locusLoading = ref(false)
    const selectedLocusData = ref(null)
    const topGenesLoading = ref(false)
    const showExpressionPlot = ref(false)
    const expressionLoading = ref(false)
    const expressionEffect = ref(null)
    const expressionError = ref('')
    const selectedExpressionPoint = ref(null)

    const topGenes = ref([])

    const expressionDialogTitle = computed(() => {
      const point = selectedExpressionPoint.value
      if (!point) return 'Expression by Genotype'
      const gene = point.gene_symbol || selectedLocusData.value?.gene || geneLocusQuery.value
      return `${point.snp_id} - ${gene} in ${tissueName.value}`
    })

    const expressionEmptyText = computed(() => (
      expressionError.value || 'Click a SNP to view expression by genotype.'
    ))

    const topGeneBars = computed(() => {
      const top = topGenes.value.slice(0, 10)
      const maxCount = top[0]?.veqtl_count || 1
      return top.map(gene => ({
        ...gene,
        percent: Math.max((gene.veqtl_count / maxCount) * 100, 4)
      }))
    })

    const loadTopGenes = async () => {
      const tissue = props.tissue || tissueName.value
      if (!tissue) return
      const cacheKey = `${tissue}::5e-8`

      if (veGenesCache.has(cacheKey)) {
        topGenes.value = veGenesCache.get(cacheKey)
        return
      }

      topGenesLoading.value = true
      try {
        const response = await fetchTopGenes(tissue, {
          p_threshold: 5e-8
        })
        const results = response.data.results || []
        topGenes.value = results.map(row => ({
          symbol: row.gene_symbol || row.Gene,
          chr: row.chr || row.Chr || '-',
          top_snp: row.top_snp || row.topSNP || '-',
          veqtl_count: row.veqtl_count
        }))
        veGenesCache.set(cacheKey, topGenes.value)
      } catch (error) {
        console.error('Error loading top genes:', error)
        topGenes.value = []
        ElMessage.error(error.message || 'Failed to load top genes')
      } finally {
        topGenesLoading.value = false
      }
    }

    const searchGeneLocus = async () => {
      const geneSymbol = geneLocusQuery.value.trim()
      if (!geneSymbol) {
        ElMessage.warning('Please enter a gene symbol')
        return
      }

      locusLoading.value = true
      try {
        const params = {
          gene: geneSymbol,
          tissue: props.tissue || tissueName.value,
          window: locusWindow.value
        }
        const cacheKey = makeLocusCacheKey(params)

        if (locusCache.has(cacheKey)) {
          selectedLocusData.value = locusCache.get(cacheKey)
          return
        }

        const response = await fetchLocus(params)
        const locusData = response.data

        if (locusData.points?.length) {
          selectedLocusData.value = locusData
          locusCache.set(cacheKey, locusData)
          ElMessage.success(`Loaded ${locusData.points.length} SNPs for ${geneSymbol.toUpperCase()}`)
        } else {
          selectedLocusData.value = null
          ElMessage.info(locusData.message || 'No locus data found for this gene')
        }
      } catch (error) {
        console.error('Error querying gene locus:', error)
        selectedLocusData.value = null
        ElMessage.error(error.message || 'Failed to load locus plot')
      } finally {
        locusLoading.value = false
      }
    }

    const plotGeneLocus = (symbol) => {
      geneLocusQuery.value = symbol
      searchGeneLocus()
      setTimeout(() => {
        document.querySelector('.locus-plot-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }

    const viewExpressionPlot = async (point) => {
      const gene = point.gene_symbol || selectedLocusData.value?.gene || geneLocusQuery.value
      const tissue = props.tissue || tissueName.value
      if (!point.snp_id || !gene || !tissue) {
        ElMessage.warning('Missing SNP, gene, or tissue information')
        return
      }

      selectedExpressionPoint.value = point
      showExpressionPlot.value = true
      expressionEffect.value = null
      expressionLoading.value = true
      expressionError.value = ''

      try {
        const response = await fetchGenotypeEffect({
          snp: point.snp_id,
          gene,
          tissue
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

    const queryGeneSuggestions = async (queryString, callback) => {
      const query = queryString.trim().toUpperCase()
      if (!query) {
        callback([])
        return
      }

      try {
        const response = await fetchGeneSuggestions({
          tissue: props.tissue || tissueName.value,
          q: query,
          limit: 20
        })
        const suggestions = (response.data.results || []).map(symbol => ({
          value: symbol
        }))
        callback(suggestions)
      } catch (error) {
        console.error('Error loading gene suggestions:', error)
        callback([])
      }
    }

    const handleGeneSuggestionSelect = (item) => {
      geneLocusQuery.value = item.value
    }

    onMounted(() => {
      const normalizedKey = props.tissue?.replace('-1', '1').replace(/-/g, '_')
      if (normalizedKey && tissueDataMap[normalizedKey]) {
        tissueData.value = tissueDataMap[normalizedKey]
      }
      loadTopGenes()
    })

    return {
      tissueName,
      tissueData,
      topGenes,
      topGeneBars,
      topGenesLoading,
      geneLocusQuery,
      locusLoading,
      selectedLocusData,
      showExpressionPlot,
      expressionLoading,
      expressionEffect,
      expressionEmptyText,
      expressionDialogTitle,
      searchGeneLocus,
      plotGeneLocus,
      viewExpressionPlot,
      queryGeneSuggestions,
      handleGeneSuggestionSelect
    }
  }
}
</script>

<style scoped>
.tissue-detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(calc(100% - 48px), 1400px);
  margin: 0 auto;
  padding: 24px 0;
}

.tissue-stat-row {
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
}

.card-title {
  color: var(--text-strong);
  font-weight: 700;
}

.card-heading {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.locus-search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(540px, 100%);
}

.locus-search .el-input {
  flex: 1;
}

.vegenes-layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.72fr) minmax(700px, 1.28fr);
  gap: 58px;
  align-items: stretch;
  width: min(100%, 1260px);
  min-width: 0;
  margin: 0 auto;
}

.vegenes-card,
.locus-plot-card {
  border-color: #dce6f3;
}

.vegenes-table {
  min-width: 0;
  width: 100%;
  margin-top: 34px;
  margin-left: 0;
}

.vegenes-table :deep(.el-table__cell) {
  padding: 11px 16px;
}

.vegenes-table :deep(.cell) {
  white-space: nowrap;
}

.vegenes-table :deep(.el-table__header .cell) {
  overflow: visible;
  text-overflow: clip;
}

.gene-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  white-space: nowrap;
}

.gene-actions :deep(.el-button) {
  margin-left: 0;
}

.vegenes-overview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  min-height: 420px;
  padding: 0;
  border: 0;
  background: transparent;
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.overview-header span {
  color: var(--text-strong);
  font-weight: 800;
}

.overview-header small {
  color: var(--muted);
}

.gene-bar-row {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr) 58px;
  gap: 12px;
  align-items: center;
  min-height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.gene-bar-row:hover .gene-bar-label {
  color: var(--primary-dark);
}

.gene-bar-label {
  overflow: hidden;
  color: var(--text-strong);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gene-bar-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e8edf5;
}

.gene-bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #D96245;
}

.gene-bar-value {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.stat-card {
  background: var(--surface);
  color: var(--text);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-strong);
}

.stat-label {
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 1180px) {
  .vegenes-layout {
    grid-template-columns: 1fr;
    gap: 26px;
    width: 100%;
  }

  .vegenes-table {
    margin-top: 0;
  }
}

@media (max-width: 760px) {
  .tissue-detail-container {
    width: min(calc(100% - 32px), 1400px);
    padding: 16px 0;
  }

  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .locus-search {
    width: 100%;
  }
  .vegenes-overview {
    min-height: auto;
  }
}
</style>
