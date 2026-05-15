<template>
  <div class="trait-smr-container">
    <section class="tool-hero">
      <h1>SMR Associations</h1>
    </section>

    <section class="filter-panel" aria-label="Filters">
      <div class="filter-title">Filters</div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-select
            v-model="filters.traitName"
            placeholder="Select Trait"
            clearable
            @change="handleFilterChange"
          >
            <el-option v-for="trait in traitOptions" :key="trait" :label="trait" :value="trait" />
          </el-select>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-select
            v-model="filters.tissue"
            placeholder="Select Tissue"
            clearable
            filterable
            @change="handleFilterChange"
          >
            <el-option
              v-for="tissue in tissues"
              :key="tissue.value"
              :label="tissue.label"
              :value="tissue.value"
            />
          </el-select>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="filters.gene"
            placeholder="Search Gene"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleFilterChange"
          />
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-button type="primary" :loading="loading" @click="handleSearch">Search</el-button>
        </el-col>
      </el-row>
    </section>

    <el-card class="traits-list-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">Associations ({{ totalTraits }})</span>
          <el-tooltip content="Download associations as XLSX" placement="top">
            <el-button
              :icon="Download"
              circle
              :disabled="!totalTraits || downloading"
              :loading="downloading"
              @click="downloadAssociations"
            />
          </el-tooltip>
        </div>
      </template>

      <el-table
        :data="traits"
        stripe
        highlight-current-row
        @current-change="handleTraitSelect"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="trait" label="Trait" width="90" />
        <el-table-column prop="tissue" label="Tissue" width="230" show-overflow-tooltip />
        <el-table-column prop="gene" label="Gene" min-width="140" />
        <el-table-column prop="topSNP" label="topSNP" min-width="150" />
        <el-table-column prop="beta" label="b_SMR" min-width="130" />
        <el-table-column label="p_SMR" min-width="150" sortable="custom" prop="pValue">
          <template #default="scope">{{ formatPValue(scope.row.pValue) }}</template>
        </el-table-column>
        <el-table-column label="p_HEIDI" min-width="150">
          <template #default="scope">{{ formatPValue(scope.row.pHEIDI) }}</template>
        </el-table-column>
        <el-table-column label="Action" width="90" fixed="right">
          <template #default="scope">
            <el-button link type="success" @click="viewPlot(scope.row)">Plot</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalTraits"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @change="fetchTraits"
      />
    </el-card>

    <div v-if="selectedTrait" class="detail-row">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">Detail Information</span>
          </div>
        </template>

        <el-descriptions :column="4" border>
          <el-descriptions-item label="Trait Name">{{ selectedTrait.trait }}</el-descriptions-item>
          <el-descriptions-item label="Tissue">{{ selectedTrait.tissue }}</el-descriptions-item>
          <el-descriptions-item label="Gene">{{ selectedTrait.gene }}</el-descriptions-item>
          <el-descriptions-item label="topSNP">{{ selectedTrait.topSNP }}</el-descriptions-item>
          <el-descriptions-item label="b_SMR">{{ selectedTrait.beta }}</el-descriptions-item>
          <el-descriptions-item label="p_SMR">{{ selectedTrait.pValue }}</el-descriptions-item>
          <el-descriptions-item label="p_HEIDI">{{ selectedTrait.pHEIDI }}</el-descriptions-item>
          <el-descriptions-item label="nsnp_HEIDI">{{ selectedTrait.nsnpHEIDI }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">Colocalization Plot</span>
          </div>
        </template>
        <div v-loading="colocLoading">
          <ManhattanPlot v-if="colocData" :trait="selectedTrait" :data="colocData" />
          <el-empty v-else :description="colocEmptyText" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import ManhattanPlot from '../components/ManhattanPlot.vue'
import { fetchSMRColoc, getTraitsSMR } from '../api'
import { Download } from '@element-plus/icons-vue'
import { makeSMRColocCacheKey, smrColocCache } from '../cache'

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

const XLSX_COLUMNS = [
  ['Trait', 'trait'],
  ['Tissue', 'tissue'],
  ['Gene', 'gene'],
  ['topSNP', 'topSNP'],
  ['b_SMR', 'beta'],
  ['se_SMR', 'se'],
  ['p_SMR', 'pValue'],
  ['p_HEIDI', 'pHEIDI'],
  ['nsnp_HEIDI', 'nsnpHEIDI'],
  ['b_GWAS', 'bGWAS'],
  ['p_GWAS', 'pGWAS'],
  ['b_eQTL', 'bEQTL'],
  ['p_eQTL', 'pEQTL']
]

const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const columnName = (index) => {
  let name = ''
  let current = index + 1
  while (current > 0) {
    const remainder = (current - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    current = Math.floor((current - 1) / 26)
  }
  return name
}

const buildSheetXml = (rows) => {
  const header = XLSX_COLUMNS.map(([label], index) => (
    `<c r="${columnName(index)}1" t="inlineStr"><is><t>${escapeXml(label)}</t></is></c>`
  )).join('')

  const body = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 2
    const cells = XLSX_COLUMNS.map(([, key], columnIndex) => {
      const value = row[key]
      const cellRef = `${columnName(columnIndex)}${rowNumber}`
      if (typeof value === 'number' && Number.isFinite(value)) {
        return `<c r="${cellRef}"><v>${value}</v></c>`
      }
      return `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`
    }).join('')
    return `<row r="${rowNumber}">${cells}</row>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">${header}</row>
    ${body}
  </sheetData>
</worksheet>`
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  }
  return crc >>> 0
})

const crc32 = (bytes) => {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const uint16 = (value) => [value & 0xff, (value >>> 8) & 0xff]
const uint32 = (value) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]

const buildZip = (files) => {
  const encoder = new TextEncoder()
  const chunks = []
  const central = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const data = encoder.encode(file.content)
    const crc = crc32(data)
    const localHeader = new Uint8Array([
      ...uint32(0x04034b50),
      ...uint16(20),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(crc),
      ...uint32(data.length),
      ...uint32(data.length),
      ...uint16(name.length),
      ...uint16(0)
    ])

    chunks.push(localHeader, name, data)

    central.push(new Uint8Array([
      ...uint32(0x02014b50),
      ...uint16(20),
      ...uint16(20),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(crc),
      ...uint32(data.length),
      ...uint32(data.length),
      ...uint16(name.length),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(0),
      ...uint32(offset)
    ]), name)

    offset += localHeader.length + name.length + data.length
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array([
    ...uint32(0x06054b50),
    ...uint16(0),
    ...uint16(0),
    ...uint16(files.length),
    ...uint16(files.length),
    ...uint32(centralSize),
    ...uint32(offset),
    ...uint16(0)
  ])

  return new Blob([...chunks, ...central, end], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}

const buildXlsxBlob = (rows) => buildZip([
  {
    name: '[Content_Types].xml',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  },
  {
    name: '_rels/.rels',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  },
  {
    name: 'xl/workbook.xml',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Associations" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
  },
  {
    name: 'xl/_rels/workbook.xml.rels',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  },
  {
    name: 'xl/worksheets/sheet1.xml',
    content: buildSheetXml(rows)
  }
])

export default {
  name: 'TraitSMR',
  components: {
    ManhattanPlot
  },
  data() {
    return {
      traits: [],
      selectedTrait: null,
      loading: false,
      downloading: false,
      colocLoading: false,
      colocData: null,
      colocError: '',
      currentPage: 1,
      pageSize: 20,
      totalTraits: 0,
      filters: {
        traitName: '',
        tissue: '',
        gene: ''
      },
      sortBy: 'p_SMR',
      sortOrder: 'asc',
      traitOptions: ['BFP', 'BMD', 'BMI', 'BMR', 'BW', 'FEV1', 'FVC', 'HC', 'HT', 'WC'],
      tissues: TISSUES.map((value) => ({
        label: formatTissueLabel(value),
        value
      })),
      Download
    }
  },
  computed: {
    colocEmptyText() {
      return this.colocError || 'Click Plot to view GWAS and veQTL signals'
    }
  },
  methods: {
    async fetchTraits() {
      if (!this.filters.traitName && !this.filters.tissue && !this.filters.gene.trim()) {
        this.traits = []
        this.totalTraits = 0
        this.selectedTrait = null
        this.$message.info('Please select a trait/tissue or enter a gene first')
        return
      }

      this.loading = true
      try {
        const response = await getTraitsSMR({
          trait_name: this.filters.traitName,
          tissue: this.filters.tissue,
          gene: this.filters.gene.trim(),
          page: this.currentPage,
          page_size: this.pageSize,
          sort_by: this.sortBy,
          sort_order: this.sortOrder
        })
        this.traits = response.data.results
        this.totalTraits = response.data.total
      } catch (error) {
        console.error('Error details:', error)
        this.$message.error(error.message || 'Failed to fetch trait list')
      } finally {
        this.loading = false
      }
    },
    handleFilterChange() {
      this.currentPage = 1
      this.fetchTraits()
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchTraits()
    },
    handleTraitSelect(row) {
      this.selectedTrait = row
    },
    handleSortChange({ prop, order }) {
      this.sortBy = prop === 'pValue' ? 'p_SMR' : 'p_SMR'
      this.sortOrder = order === 'descending' ? 'desc' : 'asc'
      this.currentPage = 1
      this.fetchTraits()
    },
    formatPValue(value) {
      if (value === null || value === undefined || value === '') return '-'
      const numberValue = Number(value)
      if (!Number.isFinite(numberValue)) return value
      if (numberValue !== 0 && Math.abs(numberValue) < 0.01) {
        return numberValue.toExponential(3)
      }
      return String(value)
    },
    async downloadAssociations() {
      if (!this.totalTraits) return

      this.downloading = true
      try {
        const pageSize = Math.min(this.totalTraits, 5000)
        const response = await getTraitsSMR({
          trait_name: this.filters.traitName,
          tissue: this.filters.tissue,
          gene: this.filters.gene.trim(),
          page: 1,
          page_size: pageSize,
          sort_by: this.sortBy,
          sort_order: this.sortOrder
        })
        const rows = response.data.results || []
        if (!rows.length) {
          this.$message.info('No associations to download')
          return
        }

        const blob = buildXlsxBlob(rows)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const trait = this.filters.traitName || 'all_traits'
        const tissue = this.filters.tissue || 'all_tissues'
        const gene = this.filters.gene.trim() || 'all_genes'
        link.href = url
        link.download = `SMR_Associations_${trait}_${tissue}_${gene}.xlsx`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)

        if (this.totalTraits > pageSize) {
          this.$message.warning(`Downloaded the first ${pageSize} associations`)
        }
      } catch (error) {
        console.error('Download failed:', error)
        this.$message.error(error.message || 'Failed to download associations')
      } finally {
        this.downloading = false
      }
    },
    viewPlot(row) {
      this.selectedTrait = row
      this.fetchColoc(row)
      setTimeout(() => {
        document.querySelector('.detail-row')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    },
    async fetchColoc(row) {
      this.colocLoading = true
      this.colocData = null
      this.colocError = ''
      const colocLimit = 20000
      const colocCenter = 'probe'
      const colocWindow = 1000000
      const cacheKey = makeSMRColocCacheKey({
        trait: row.trait,
        tissue: row.tissue,
        gene: row.gene,
        topSNP: row.topSNP,
        window: colocWindow,
        limit: colocLimit,
        center: colocCenter
      })
      if (smrColocCache.has(cacheKey)) {
        this.colocData = smrColocCache.get(cacheKey)
        this.colocLoading = false
        return
      }
      try {
        const response = await fetchSMRColoc({
          trait: row.trait,
          tissue: row.tissue,
          gene: row.gene,
          top_snp: row.topSNP,
          chr: row.topSNPChr,
          bp: row.topSNPBp,
          window: colocWindow,
          limit: colocLimit,
          center: colocCenter
        })
        const data = response.data
        if (!data.gwas_points?.length && !data.veqtl_points?.length) {
          this.colocError = data.message || 'No colocalization data found'
          return
        }
        this.colocData = data
        smrColocCache.set(cacheKey, data)
      } catch (error) {
        console.error('Failed to fetch colocalization data:', error)
        this.colocError = error.message || 'Failed to fetch colocalization data'
      } finally {
        this.colocLoading = false
      }
    }
  }
}
</script>

<style scoped>
.trait-smr-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(calc(100% - 48px), 1400px);
  margin: 0 auto;
  padding: 24px 0;
}

.filter-panel {
  margin-bottom: 0;
  padding: 18px 20px 20px;
  border: 1px solid #dce6f3;
  border-radius: var(--radius);
  background:
    radial-gradient(circle at 0 0, rgba(37, 99, 235, 0.06), transparent 28%),
    #fff;
  box-shadow: none;
}

.filter-title {
  margin-bottom: 14px;
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 700;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  color: var(--text-strong);
  font-size: 18px;
  font-weight: 700;
}

.traits-list-card {
  min-width: 0;
  margin-bottom: 0;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.detail-row {
  display: grid;
  gap: 20px;
  margin-top: 0;
}

.detail-row :deep(.el-card__body) {
  background: #fff;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-button--text) {
  padding: 0 8px;
}

@media (max-width: 760px) {
  .trait-smr-container {
    width: min(calc(100% - 32px), 1400px);
    padding: 16px 0;
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }
}

@media (max-width: 1180px) {
  :deep(.el-table) {
    font-size: 13px;
  }

  :deep(.el-table .cell) {
    padding: 0 8px;
  }
}
</style>
