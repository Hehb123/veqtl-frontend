<template>
  <div class="home-container">
    <!-- 椤堕儴浠嬬粛 -->
    <section class="home-hero">
      <div class="hero-copy">
        <h1>veQTL-Atlas</h1>
        <p>
          Browse variance expression quantitative trait loci (veQTL) across GTEx tissues.
        </p>
      </div>
    </section>

    <section class="module-grid" aria-label="Main modules">
      <button class="module-card" type="button" @click="goToRoute('/query')">
        <el-icon class="module-icon"><Search /></el-icon>
        <span>Query</span>
        <strong>SNP-Gene Pair Search</strong>
        <small>Inspect cross-tissue evidence and heatmap signals.</small>
      </button>
      <button class="module-card" type="button" @click="goToRoute('/trait/smr')">
        <el-icon class="module-icon"><TrendCharts /></el-icon>
        <span>SMR Associations</span>
        <strong>SMR Associations</strong>
        <small>Browse SMR associations by trait and tissue.</small>
      </button>
      <button class="module-card" type="button" @click="goToRoute('/download')">
        <el-icon class="module-icon"><Download /></el-icon>
        <span>Download</span>
        <strong>Summary Data</strong>
        <small>Access veQTL summary data in parquet format.</small>
      </button>
    </section>

    <section class="explore-section" aria-labelledby="explore-by-tissue">
      <div class="section-divider">
        <h2 id="explore-by-tissue">Explore by Tissue</h2>
      </div>
    </section>

    <div class="tissues-container">
      <section class="tissue-browser">
        <div class="browser-header">
          <div class="tissue-legend" aria-label="Tissue category legend">
            <button
              :class="['legend-item', 'all-filter', { active: activeCategory === 'all' }]"
              type="button"
              @click="toggleCategory('all')"
            >
              <i aria-hidden="true"></i>
              All
            </button>
            <button
              v-for="group in tissueGroups"
              :key="group.value"
              :class="['legend-item', { active: activeCategory === group.value, muted: activeCategory && activeCategory !== group.value }]"
              :style="categoryStyle(group.value)"
              type="button"
              @click="toggleCategory(group.value)"
            >
              <i aria-hidden="true"></i>
              {{ group.label }}
            </button>
          </div>
        </div>
        <div v-if="activeCategory" class="browser-body">
          <div class="tissue-pill-grid">
            <button
              v-for="tissue in visibleTissues"
              :key="tissue.value"
              class="tissue-pill"
              :style="categoryStyle(tissue.category)"
              type="button"
              @click="goToTissueDetail(tissue.value)"
            >
              {{ tissue.label }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Search, TrendCharts } from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    Download,
    Search,
    TrendCharts
  },
  setup() {
    const router = useRouter()
    const activeCategory = ref(null)
    
    const tissues = ref([
      { label: 'Adipose Subcutaneous', value: 'Adipose_Subcutaneous', sample_size: 599, genes: 762, veqtl: 36179, category: 'Adipose' },
      { label: 'Adipose Visceral Omentum', value: 'Adipose_Visceral_Omentum', sample_size: 499, genes: 524, veqtl: 23908, category: 'Adipose' },
      { label: 'Adrenal Gland', value: 'Adrenal_Gland', sample_size: 253, genes: 131, veqtl: 2313, category: 'Endocrine' },
      { label: 'Artery Aorta', value: 'Artery_Aorta', sample_size: 409, genes: 457, veqtl: 20559, category: 'Cardiovascular' },
      { label: 'Artery Coronary', value: 'Artery_Coronary', sample_size: 223, genes: 75, veqtl: 1140, category: 'Cardiovascular' },
      { label: 'Artery Tibial', value: 'Artery_Tibial', sample_size: 573, genes: 757, veqtl: 46067, category: 'Cardiovascular' },
      { label: 'Bladder', value: 'Bladder', sample_size: 69, genes: 0, veqtl: 0, category: 'Urinary' },
      { label: 'Brain Amygdala', value: 'Brain_Amygdala', sample_size: 167, genes: 19, veqtl: 181, category: 'Brain' },
      { label: 'Brain Anterior cingulate cortex BA24', value: 'Brain_Anterior_cingulate_cortex_BA24', sample_size: 212, genes: 97, veqtl: 4281, category: 'Brain' },
      { label: 'Brain Caudate basal ganglia', value: 'Brain_Caudate_basal_ganglia', sample_size: 266, genes: 190, veqtl: 3088, category: 'Brain' },
      { label: 'Brain Cerebellar Hemisphere', value: 'Brain_Cerebellar_Hemisphere', sample_size: 247, genes: 225, veqtl: 4333, category: 'Brain' },
      { label: 'Brain Cerebellum', value: 'Brain_Cerebellum', sample_size: 241, genes: 173, veqtl: 5513, category: 'Brain' },
      { label: 'Brain Cortex', value: 'Brain_Cortex', sample_size: 242, genes: 175, veqtl: 2804, category: 'Brain' },
      { label: 'Brain Frontal Cortex BA9', value: 'Brain_Frontal_Cortex_BA9', sample_size: 238, genes: 167, veqtl: 2263, category: 'Brain' },
      { label: 'Brain Hippocampus', value: 'Brain_Hippocampus', sample_size: 228, genes: 94, veqtl: 1190, category: 'Brain' },
      { label: 'Brain Hypothalamus', value: 'Brain_Hypothalamus', sample_size: 234, genes: 106, veqtl: 1503, category: 'Brain' },
      { label: 'Brain Nucleus accumbens basal ganglia', value: 'Brain_Nucleus_accumbens_basal_ganglia', sample_size: 259, genes: 187, veqtl: 2675, category: 'Brain' },
      { label: 'Brain Putamen basal ganglia', value: 'Brain_Putamen_basal_ganglia', sample_size: 231, genes: 110, veqtl: 1450, category: 'Brain' },
      { label: 'Brain Spinal cord cervical c-1', value: 'Brain_Spinal_cord_cervical_c-1', sample_size: 185, genes: 57, veqtl: 681, category: 'Brain' },
      { label: 'Brain Substantia nigra', value: 'Brain_Substantia_nigra', sample_size: 165, genes: 26, veqtl: 254, category: 'Brain' },
      { label: 'Breast Mammary Tissue', value: 'Breast_Mammary_Tissue', sample_size: 440, genes: 458, veqtl: 17151, category: 'Reproductive' },
      { label: 'Cells Cultured fibroblasts', value: 'Cells_Cultured_fibroblasts', sample_size: 553, genes: 1017, veqtl: 54458, category: 'Cell Lines' },
      { label: 'Cells EBV-transformed lymphocytes', value: 'Cells_EBV-transformed_lymphocytes', sample_size: 256, genes: 212, veqtl: 10065, category: 'Cell Lines' },
      { label: 'Colon Sigmoid', value: 'Colon_Sigmoid', sample_size: 357, genes: 351, veqtl: 12090, category: 'Digestive' },
      { label: 'Colon Transverse', value: 'Colon_Transverse', sample_size: 396, genes: 444, veqtl: 17398, category: 'Digestive' },
      { label: 'Esophagus Gastroesophageal Junction', value: 'Esophagus_Gastroesophageal_Junction', sample_size: 345, genes: 312, veqtl: 8318, category: 'Digestive' },
      { label: 'Esophagus Mucosa', value: 'Esophagus_Mucosa', sample_size: 518, genes: 625, veqtl: 32454, category: 'Digestive' },
      { label: 'Esophagus Muscularis', value: 'Esophagus_Muscularis', sample_size: 475, genes: 650, veqtl: 29653, category: 'Digestive' },
      { label: 'Heart Atrial Appendage', value: 'Heart_Atrial_Appendage', sample_size: 399, genes: 315, veqtl: 10396, category: 'Cardiovascular' },
      { label: 'Heart Left Ventricle', value: 'Heart_Left_Ventricle', sample_size: 380, genes: 241, veqtl: 5968, category: 'Cardiovascular' },
      { label: 'Kidney Cortex', value: 'Kidney_Cortex', sample_size: 88, genes: 2, veqtl: 12, category: 'Urinary' },
      { label: 'Liver', value: 'Liver', sample_size: 233, genes: 85, veqtl: 4463, category: 'Metabolic' },
      { label: 'Lung', value: 'Lung', sample_size: 515, genes: 566, veqtl: 29222, category: 'Respiratory' },
      { label: 'Minor Salivary Gland', value: 'Minor_Salivary_Gland', sample_size: 145, genes: 37, veqtl: 372, category: 'Glandular' },
      { label: 'Muscle Skeletal', value: 'Muscle_Skeletal', sample_size: 695, genes: 633, veqtl: 42821, category: 'Musculoskeletal' },
      { label: 'Nerve Tibial', value: 'Nerve_Tibial', sample_size: 561, genes: 1064, veqtl: 54575, category: 'Peripheral Nerve' },
      { label: 'Ovary', value: 'Ovary', sample_size: 160, genes: 41, veqtl: 691, category: 'Reproductive' },
      { label: 'Pancreas', value: 'Pancreas', sample_size: 296, genes: 178, veqtl: 3185, category: 'Metabolic' },
      { label: 'Pituitary', value: 'Pituitary', sample_size: 288, genes: 215, veqtl: 7589, category: 'Endocrine' },
      { label: 'Prostate', value: 'Prostate', sample_size: 237, genes: 116, veqtl: 1788, category: 'Reproductive' },
      { label: 'Skin Not Sun Exposed Suprapubic', value: 'Skin_Not_Sun_Exposed_Suprapubic', sample_size: 553, genes: 749, veqtl: 38484, category: 'Skin' },
      { label: 'Skin Sun Exposed Lower leg', value: 'Skin_Sun_Exposed_Lower_leg', sample_size: 644, genes: 894, veqtl: 52595, category: 'Skin' },
      { label: 'Small Intestine Terminal Ileum', value: 'Small_Intestine_Terminal_Ileum', sample_size: 165, genes: 62, veqtl: 656, category: 'Digestive' },
      { label: 'Spleen', value: 'Spleen', sample_size: 225, genes: 164, veqtl: 2590, category: 'Immune/Blood' },
      { label: 'Stomach', value: 'Stomach', sample_size: 335, genes: 226, veqtl: 10450, category: 'Digestive' },
      { label: 'Testis', value: 'Testis', sample_size: 350, genes: 616, veqtl: 21564, category: 'Reproductive' },
      { label: 'Thyroid', value: 'Thyroid', sample_size: 585, genes: 1022, veqtl: 59129, category: 'Endocrine' },
      { label: 'Uterus', value: 'Uterus', sample_size: 123, genes: 11, veqtl: 128, category: 'Reproductive' },
      { label: 'Vagina', value: 'Vagina', sample_size: 146, genes: 18, veqtl: 306, category: 'Reproductive' },
      { label: 'Whole Blood', value: 'Whole_Blood', sample_size: 677, genes: 822, veqtl: 54898, category: 'Immune/Blood' }
    ])

    const groupOrder = [
      'Brain',
      'Cardiovascular',
      'Digestive',
      'Endocrine',
      'Reproductive',
      'Immune/Blood',
      'Metabolic',
      'Adipose',
      'Skin',
      'Respiratory',
      'Urinary',
      'Musculoskeletal',
      'Peripheral Nerve',
      'Glandular',
      'Cell Lines'
    ]

    const categoryColors = {
      Brain: { bg: '#eef5ff', border: '#9db8e5', text: '#2f66b3' },
      Cardiovascular: { bg: '#fff1ee', border: '#e4aa9d', text: '#b64d35' },
      Digestive: { bg: '#ecf8f3', border: '#94cdbb', text: '#257b64' },
      Endocrine: { bg: '#f4f0ff', border: '#b9a7e3', text: '#6d55b5' },
      Reproductive: { bg: '#fff0f7', border: '#e5a9c7', text: '#b64f82' },
      'Immune/Blood': { bg: '#fff7e8', border: '#dfbf7a', text: '#9b6b18' },
      Metabolic: { bg: '#eff8ec', border: '#a6cd9b', text: '#4b843b' },
      Adipose: { bg: '#fff4eb', border: '#dfb38c', text: '#a85e2f' },
      Skin: { bg: '#eefafa', border: '#9dcccc', text: '#397f7f' },
      Respiratory: { bg: '#edf7ff', border: '#9dc7e5', text: '#3679ad' },
      Urinary: { bg: '#f2f5fb', border: '#aebbd3', text: '#5f729b' },
      Musculoskeletal: { bg: '#f6f3ef', border: '#c7b9a8', text: '#78685a' },
      'Peripheral Nerve': { bg: '#f0f3ff', border: '#aab7e8', text: '#536cbd' },
      Glandular: { bg: '#f7f1fb', border: '#c5a9dc', text: '#7d5aa0' },
      'Cell Lines': { bg: '#f3f6f8', border: '#b3c0ca', text: '#627381' }
    }

    const fallbackCategoryColor = { bg: '#f3f6f8', border: '#b3c0ca', text: '#627381' }

    const tissueGroups = computed(() => [
      ...groupOrder.map((category) => ({
        label: category,
        value: category,
        count: tissues.value.filter((tissue) => tissue.category === category).length,
        color: categoryColors[category]
      })).filter((group) => group.count)
    ])

    const visibleTissues = computed(() => {
      if (!activeCategory.value) return []
      if (activeCategory.value === 'all') return tissues.value
      return tissues.value.filter((tissue) => tissue.category === activeCategory.value)
    })

    const categoryStyle = (category) => {
      const color = categoryColors[category] || fallbackCategoryColor
      return {
        '--pill-bg': color.bg,
        '--pill-border': color.border,
        '--pill-text': color.text
      }
    }

    const goToTissueDetail = (tissueName) => {
      router.push({
        name: 'TissueDetail',
        params: { tissue: tissueName }
      })
    }

    const goToRoute = (path) => {
      router.push(path)
    }

    const toggleCategory = (category) => {
      activeCategory.value = activeCategory.value === category ? null : category
    }

    return {
      activeCategory,
      tissueGroups,
      visibleTissues,
      categoryStyle,
      toggleCategory,
      goToTissueDetail,
      goToRoute
    }
  }
}
</script>

<style scoped>
.home-container {
  width: min(calc(100% - 48px), 1400px);
  padding: 24px 0;
  margin: 0 auto;
}

.home-hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 22px;
  padding: 54px 34px 48px;
  border-bottom: 1px solid var(--border);
  background:
    radial-gradient(circle at 50% 18%, rgba(37, 99, 235, 0.13), transparent 36%),
    linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
}

.hero-copy h1 {
  margin-bottom: 16px;
  color: var(--text-strong);
  font-size: clamp(34px, 4vw, 52px);
  line-height: 0.98;
}

.hero-copy p:not(.eyebrow) {
  margin: 0 auto;
  max-width: 740px;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.7;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 30px;
}

.module-card {
  position: relative;
  min-height: 142px;
  padding: 20px 20px 20px 78px;
  border: 1px solid #dce6f3;
  background: #f7fbff;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}

.module-icon {
  position: absolute;
  top: 22px;
  left: 22px;
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #d6dde8;
  border-radius: 8px;
  background: #f8fafc;
  color: var(--primary);
  font-size: 20px;
}

.module-card span,
.module-card strong,
.module-card small {
  display: block;
}

.module-card span {
  margin-bottom: 16px;
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.module-card strong {
  margin-bottom: 8px;
  color: var(--text-strong);
  font-size: 19px;
  font-weight: 700;
}

.module-card small {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.module-card:hover {
  border-color: #6f8fb8;
  background: #eef5ff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.module-card:hover .module-icon {
  border-color: #8ea9cf;
  background: #dfeaff;
  color: #1d4ed8;
}

.explore-section {
  margin: 54px 0 18px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-divider::after {
  flex: 1;
  height: 1px;
  background: #e6edf5;
  content: "";
}

.section-divider h2 {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tissues-container {
  width: 100%;
}

.tissue-browser {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 0;
  background: var(--surface);
}

.browser-header {
  display: block;
  min-height: 58px;
  padding: 0 18px;
  border-bottom: 1px solid var(--border);
  color: var(--text-strong);
  font-weight: 700;
}

.tissue-legend {
  display: grid;
  grid-template-columns: repeat(8, minmax(120px, 1fr));
  gap: 12px 18px;
  padding: 16px 0 15px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--pill-text);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, opacity 0.16s ease;
}

.legend-item:hover,
.legend-item.active {
  border-color: var(--pill-border);
  background: var(--pill-bg);
}

.legend-item.muted {
  opacity: 0.45;
}

.legend-item.all-filter {
  --pill-bg: #f7faff;
  --pill-border: #d8e4f2;
  --pill-text: var(--primary-dark);
}

.legend-item i {
  width: 9px;
  height: 9px;
  border: 1px solid var(--pill-border);
  border-radius: 999px;
  background: var(--pill-bg);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.55);
}

.browser-body {
  padding: 20px 18px 24px;
}

.tissue-pill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px 14px;
}

.tissue-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--pill-border);
  border-radius: 999px;
  background: var(--pill-bg);
  color: color-mix(in srgb, var(--pill-text) 72%, #111827);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease, transform 0.16s ease;
}

.tissue-pill:hover {
  border-color: var(--pill-text);
  background: color-mix(in srgb, var(--pill-bg) 82%, white);
  color: var(--pill-text);
  transform: translateY(-1px);
}

@media (max-width: 1180px) {
  .module-grid {
    grid-template-columns: 1fr;
  }

  .tissue-legend {
    grid-template-columns: repeat(4, minmax(120px, 1fr));
  }
}

@media (max-width: 900px) {
  .home-container {
    width: min(calc(100% - 32px), 1400px);
    padding: 16px 0;
  }

  .tissue-pill-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .tissue-legend {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}

@media (max-width: 640px) {
  .home-hero {
    padding: 28px 20px;
    padding-top: 18px;
  }

}
</style>
