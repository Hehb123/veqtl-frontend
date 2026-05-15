<template>
  <div class="gene-detail-container">
    <section class="tool-hero">
      <h1>Gene: {{ symbol }}</h1>
      <p>Explore cross-tissue variance expression quantitative trait loci (veQTL).</p>
    </section>

    <el-row :gutter="20" class="gene-sections">
      <!-- Section 1: 璺ㄧ粍缁?veQTL 姘旀场鍥?-->
      <el-col :span="24">
        <el-card shadow="hover" class="gene-card">
          <template #header>
            <div class="card-header">
              <span>Cross-Tissue veQTL Landscape (50 GTEx Tissues)</span>
            </div>
          </template>
          <!-- ECharts 缁勪欢 -->
          <v-chart class="chart" :option="bubbleChartOption" autoresize />
        </el-card>
      </el-col>

      <!-- Section 2 & 3: 浣跨敤Tabs鍒囨崲鏂瑰樊鍒嗘瀽鍜屽叧鑱旀€х姸 -->
      <el-col :span="24" class="secondary-section">
        <el-tabs>
          <el-tab-pane label="Variance Analysis" name="variance">
            <el-card shadow="hover" class="gene-card">
              <template #header>
                <span>Genotype-driven Variance (veQTL Effect)</span>
                <el-tag size="small" type="danger" style="margin-left: 10px;">Adipose - Subcutaneous</el-tag>
              </template>
              <!-- 绀烘剰鍥撅細鍒╃敤鏂瑰樊绠辩嚎鍥惧睍绀?-->
              <v-chart class="chart" :option="boxplotOption" autoresize />
            </el-card>
          </el-tab-pane>
          
          <el-tab-pane label="Associated Traits" name="traits">
            <el-card shadow="hover" class="gene-card">
              <template #header>
                <span>Linked Complex Traits (SMR Results)</span>
              </template>
              <el-table :data="smrData" border stripe>
                <el-table-column prop="trait" label="Trait (10 Body Compositions)" />
                <el-table-column prop="beta" label="SMR Beta" width="100" />
                <el-table-column prop="pvalue" label="SMR P-value" width="120" />
                <el-table-column prop="status" label="Status" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.pvalue < 5e-8 ? 'success' : 'info'">
                      {{ scope.row.pvalue < 5e-8 ? 'Significant' : 'Not Sig' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['symbol'])

// --- 鍋囨暟鎹細10涓€х姸 SMR 缁撴灉 ---
const smrData = ref([
  { trait: 'Body Mass Index (BMI)', beta: '0.32', pvalue: 1.2e-10 },
  { trait: 'Body Fat Percentage', beta: '0.28', pvalue: 4.5e-9 },
  { trait: 'Waist-to-Hip Ratio', beta: '0.05', pvalue: 0.12 }
])

// --- 鍥捐〃閰嶇疆 1: 璺ㄧ粍缁囨皵娉″浘 (X: Tissues, Y: SNPs) ---
// 鍦ㄧ湡瀹為」鐩腑锛岃繖閲岀殑鏁版嵁搴旈€氳繃 axios 浠庡悗绔幏鍙?
const bubbleChartOption = ref({
  tooltip: { trigger: 'item' },
  grid: { left: '10%', right: '5%', bottom: '20%' },
  xAxis: {
    type: 'category',
    data: ['Brain', 'Blood', 'Adipose', 'Muscle', 'Liver'], // 缂╃暐50涓粍缁?
    axisLabel: { interval: 0, rotate: 45 }
  },
  yAxis: {
    type: 'category',
    data: ['rs1421085', 'rs9939609', 'rs8050136']
  },
  series: [{
    type: 'scatter',
    data: [
      // [x鍧愭爣绱㈠紩, y鍧愭爣绱㈠紩, effect size(姘旀场澶у皬), -log10(p)(棰滆壊)]
      [0, 0, 10, 5], [2, 0, 30, 15], [3, 0, 20, 8], 
      [2, 1, 40, 20], [2, 2, 25, 12]
    ],
    symbolSize: function (data) { return data[2]; }, // 姘旀场澶у皬瀵瑰簲 Effect Size
    itemStyle: {
      color: function (params) {
        // 棰滆壊娣卞害瀵瑰簲 P-value (鍋囧畾鏁板€艰秺澶瓒婃樉钁?
        const pval = params.data[3];
        return pval > 10 ? '#ef4444' : '#3b82f6';
      }
    }
  }]
})

// --- 鍥捐〃閰嶇疆 2: veQTL 鏂瑰樊绠辩嚎鍥?---
// 閲嶇偣锛氱獊鍑烘柟宸?璺ㄥ害)鐨勫尯鍒紝鑰屼笉鏄潎鍊?
const boxplotOption = ref({
  tooltip: { trigger: 'item', axisPointer: { type: 'shadow' } },
  grid: { left: '10%', right: '5%', bottom: '15%' },
  xAxis: { type: 'category', data: ['AA', 'AB', 'BB'] },
  yAxis: { type: 'value', name: 'Expression Level' },
  series: [{
    name: 'Expression Variance',
    type: 'boxplot',
    // [min, Q1, median, Q3, max]
    data: [
      [10, 11, 12, 13, 14],      // AA: 鏂瑰樊鏋佸皬
      [8, 10, 12, 14, 16],       // AB: 鏂瑰樊涓瓑
      [2, 6, 12, 18, 22]         // BB: 鏂瑰樊鏋佸ぇ (veQTL 鏁堝簲鏄捐憲)
    ],
    itemStyle: { color: '#8b5cf6' }
  }]
})
</script>

<style scoped>
.gene-detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(calc(100% - 48px), 1400px);
  margin: 0 auto;
  padding: 24px 0;
}

.gene-sections {
  margin: 0;
}

.secondary-section {
  margin-top: 20px;
}

.gene-card {
  border-color: #dce6f3;
}

.chart { height: 400px; width: 100%; }

@media (max-width: 760px) {
  .gene-detail-container {
    width: min(calc(100% - 32px), 1400px);
    padding: 16px 0;
  }
}
</style>
