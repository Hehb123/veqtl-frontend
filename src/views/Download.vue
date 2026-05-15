<template>
  <div class="download-container">
    <section class="tool-hero">
      <h1>veQTL summary data</h1>
      <p>
        Access veQTL summary data in parquet format.
      </p>
    </section>

    <el-card class="download-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">veQTL summary data</span>
          <el-tag type="info" effect="plain">{{ datasets.length }} files</el-tag>
        </div>
      </template>

      <el-table :data="datasets" stripe>
        <el-table-column prop="name" label="Tissue" min-width="220" />
        <el-table-column prop="kind" label="Directory" width="140" />
        <el-table-column prop="format" label="Format" width="120" />
        <el-table-column prop="size" label="Size" width="140" />
        <el-table-column label="Action" width="140" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="downloadFile(scope.row)">
              Download
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { API_BASE_URL, fetchDownloads } from '../api'

const datasets = ref([])
const loading = ref(false)

const formatBytes = (bytes) => {
  if (!bytes) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`
}

const loadDownloads = async () => {
  loading.value = true
  try {
    const response = await fetchDownloads()
    datasets.value = (response.data.results || []).map((item) => ({
      ...item,
      format: 'Parquet',
      size: formatBytes(item.size_bytes),
      url: `${API_BASE_URL}/downloads/${item.kind}/${item.name}`
    }))
  } catch (error) {
    console.error('Failed to load downloads:', error)
    ElMessage.error(error.message || 'Failed to load downloads')
  } finally {
    loading.value = false
  }
}

const downloadFile = (row) => {
  window.location.href = row.url
}

onMounted(loadDownloads)
</script>

<style scoped>
.download-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(calc(100% - 48px), 1400px);
  margin: 0 auto;
  padding: 24px 0;
}

.download-card {
  border-color: #dce6f3;
  background:
    radial-gradient(circle at 100% 0, rgba(37, 99, 235, 0.07), transparent 28%),
    #fff;
}

:deep(.el-table) {
  width: 100%;
}

@media (max-width: 760px) {
  .download-container {
    width: min(calc(100% - 32px), 1400px);
    padding: 16px 0;
  }
}
</style>
