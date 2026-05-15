<template>
  <div class="docs-container">
    <section class="tool-hero docs-hero">
      <h1>Documentation</h1>
      <p>
        A practical guide to browsing veQTL signals, tissue-level associations,
        locus plots, SMR results, and expression-by-genotype evidence.
      </p>
    </section>

    <div class="docs-layout">
      <aside class="docs-nav" aria-label="Documentation sections">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          :class="{ active: activeSection === section.id, child: section.child }"
          @click="setActiveSection(section.id)"
        >
          {{ section.label }}
        </a>
      </aside>

      <article class="docs-content">
        <section id="overview" class="docs-section">
          <h2>Overview</h2>
          <p>
            veQTL-Atlas provides tissue-level variance expression quantitative
            trait loci across GTEx tissues. The browser is designed around
            tissue exploration, SNP-gene pair queries, SMR associations,
            and downloadable summary data.
          </p>
        </section>

        <section id="tissue" class="docs-section">
          <h2>Tissue Browser</h2>
          <div class="guide-panel">
            <div class="guide-copy">
              <p>
                The home page groups tissues by biological category. Select a label
                such as Brain, Digestive, or Immune/Blood to reveal tissues in that
                group. Select All to show every tissue.
              </p>
              <ol class="steps">
                <li>Choose a tissue category label.</li>
                <li>Click a tissue capsule to open the tissue detail page.</li>
                <li>Inspect veGenes and launch a 1000 kb locus plot.</li>
              </ol>
            </div>
            <div class="ui-mock tissue-mock" aria-hidden="true">
              <div class="mock-caption">Category labels</div>
              <span>All</span><span>Brain</span><span>Digestive</span><span>Immune/Blood</span>
              <div class="mock-caption">Tissue capsules</div>
              <b>Whole Blood</b><b>Spleen</b><b>Brain Cortex</b>
            </div>
          </div>
        </section>

        <section id="locus" class="docs-section child-section">
          <h2>Locus Plot</h2>
          <div class="guide-panel">
            <div class="guide-copy">
              <p>
                Locus plots show regional SNP-level association evidence around a
                selected gene. Points represent variants, the x-axis is genomic
                position, and the y-axis is association strength.
              </p>
              <ol class="steps">
                <li>Hover over a point to inspect SNP ID and exact position.</li>
                <li>Use drag or zoom to inspect dense local regions.</li>
              </ol>
            </div>
            <div class="ui-mock locus-mock" aria-hidden="true">
              <strong>CDK10</strong>
              <i style="--x: 8%; --y: 72%"></i>
              <i style="--x: 18%; --y: 66%"></i>
              <i style="--x: 30%; --y: 52%"></i>
              <i style="--x: 45%; --y: 24%"></i>
              <i style="--x: 51%; --y: 30%"></i>
              <i style="--x: 65%; --y: 58%"></i>
              <i style="--x: 82%; --y: 68%"></i>
              <span></span>
            </div>
          </div>
        </section>

        <section id="query" class="docs-section">
          <h2>SNP-Gene Query</h2>
          <div class="guide-panel">
            <div class="guide-copy">
              <p>
                Use the Query page to search one or more SNP-gene pairs. Enter each
                pair as a SNP ID and gene symbol separated by a comma.
              </p>
              <div class="example-line">rs62068366,CDK10</div>
              <ol class="steps">
                <li>Type a SNP-gene pair into the search box.</li>
                <li>Click Search to generate the tissue presence heatmap.</li>
                <li>Select a colored cell to view records for that tissue.</li>
              </ol>
            </div>
            <div class="ui-mock search-mock" aria-hidden="true">
              <div class="mock-caption">Search format</div>
              <div class="mock-search">rs62068366,CDK10 <span>Search</span></div>
              <div class="mock-caption">Tissue presence heatmap</div>
              <div class="mock-heatmap">
                <b></b><b></b><b class="hot"></b><b></b><b class="warm"></b>
                <b></b><b class="hot"></b><b></b><b class="warm"></b><b></b>
                <b class="warm"></b><b></b><b></b><b class="hot"></b><b></b>
              </div>
            </div>
          </div>
        </section>

        <section id="expression" class="docs-section child-section">
          <h2>Expression by Genotype</h2>
          <div class="guide-panel">
            <div class="guide-copy">
              <p>
                In Query results, click Plot in the Action column to open a compact
                expression-by-genotype dialog. The plot combines a boxplot with
                sample-level scatter points.
              </p>
              <ul>
                <li>x-axis: SNP genotype dosage group</li>
                <li>y-axis: normalized gene expression</li>
                <li>n labels: matched sample count per genotype group</li>
              </ul>
            </div>
            <div class="ui-mock genotype-mock" aria-hidden="true">
              <strong>Expression by Genotype</strong>
              <div class="geno-box low"><span></span></div>
              <div class="geno-box medium"><span></span></div>
              <div class="geno-box high"><span></span></div>
              <small>0</small><small>1</small><small>2</small>
            </div>
          </div>
        </section>

        <section id="smr" class="docs-section">
          <h2>SMR Associations</h2>
          <div class="guide-panel">
            <div class="guide-copy">
              <p>
                The SMR Associations page lists associations by trait and tissue.
                Results can be sorted by p_SMR. Plot actions allow inspection of
                selected associations.
              </p>
              <ol class="steps">
                <li>Select a trait and tissue filter.</li>
                <li>Sort by p_SMR to prioritize stronger associations.</li>
                <li>Use Plot to inspect the selected record.</li>
              </ol>
            </div>
            <div class="ui-mock table-mock" aria-hidden="true">
              <span>Trait</span><span>Tissue</span><span>Gene</span><span>p_SMR</span>
              <b>BMD</b><b>Artery Aorta</b><b>UVSSA</b><b>2.27e-12</b>
              <b>BMD</b><b>Whole Blood</b><b>CDK10</b><b>3.23e-20</b>
            </div>
          </div>
        </section>

        <section id="download" class="docs-section">
          <h2>Download</h2>
          <p>
            The Download page provides veQTL summary data files. Files are
            distributed as Parquet for efficient downstream analysis and
            reproducible data access.
          </p>
        </section>

      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Documentation',
  data() {
    return {
      activeSection: 'overview',
      sections: [
        { id: 'overview', label: 'Overview' },
        { id: 'tissue', label: 'Tissue Browser' },
        { id: 'locus', label: 'Locus Plot', child: true },
        { id: 'query', label: 'SNP-Gene Query' },
        { id: 'expression', label: 'Expression by Genotype', child: true },
        { id: 'smr', label: 'SMR Associations' },
        { id: 'download', label: 'Download' }
      ]
    }
  },
  mounted() {
    this.syncActiveSection()
    window.addEventListener('scroll', this.syncActiveSection, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.syncActiveSection)
  },
  methods: {
    setActiveSection(id) {
      this.activeSection = id
    },
    syncActiveSection() {
      const offset = 130
      let current = this.sections[0].id

      this.sections.forEach((section) => {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= offset) {
          current = section.id
        }
      })

      this.activeSection = current
    }
  }
}
</script>

<style scoped>
.docs-container {
  width: min(calc(100% - 48px), 1400px);
  margin: 0 auto;
  padding: 24px 0 48px;
}

.docs-hero {
  margin-bottom: 28px;
}

.docs-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 30px;
  align-items: start;
}

.docs-nav {
  position: sticky;
  top: 96px;
  display: grid;
  gap: 4px;
  padding: 12px 0 12px 20px;
}

.docs-nav::before {
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  background: #e2ebf6;
  content: "";
}

.docs-nav a {
  position: relative;
  padding: 7px 12px;
  border-radius: 6px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.16s ease, background 0.16s ease;
}

.docs-nav a::before {
  position: absolute;
  left: -20px;
  top: 7px;
  width: 3px;
  height: calc(100% - 14px);
  border-radius: 999px;
  background: transparent;
  content: "";
  transition: background 0.16s ease;
}

.docs-nav a:hover {
  background: #eef6ff;
  color: var(--primary-dark);
}

.docs-nav a:hover::before {
  background: #9fc3ee;
}

.docs-nav a.child {
  margin-left: 18px;
  padding-top: 6px;
  padding-bottom: 6px;
  color: #7b8794;
  font-size: 13px;
  font-weight: 600;
}

.docs-nav a.child::after {
  position: absolute;
  left: -6px;
  top: 50%;
  width: 8px;
  height: 1px;
  background: #c9d7e8;
  content: "";
}

.docs-nav a.active {
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.docs-nav a.active::before {
  background: var(--primary);
}

.docs-content {
  display: grid;
  gap: 18px;
}

.docs-section {
  padding: 24px 26px;
  border: 1px solid #dce6f3;
  border-radius: var(--radius);
  background:
    radial-gradient(circle at 100% 0, rgba(37, 99, 235, 0.05), transparent 24%),
    var(--surface);
  box-shadow: var(--shadow-sm);
}

.child-section {
  margin-left: 24px;
  border-color: #d8e4f2;
  background:
    radial-gradient(circle at 0 0, rgba(217, 98, 69, 0.045), transparent 24%),
    #fbfdff;
}

.docs-section h2 {
  margin: 0 0 12px;
  color: var(--text-strong);
  font-size: 22px;
}

.child-section h2 {
  font-size: 20px;
}

.docs-section p {
  margin: 0 0 12px;
  color: var(--text);
  font-size: 15px;
  line-height: 1.75;
}

.docs-section p:last-child {
  margin-bottom: 0;
}

.guide-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.92fr);
  gap: 28px;
  align-items: center;
}

.overview-panel {
  align-items: stretch;
}

.guide-copy {
  min-width: 0;
}

.steps {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
  color: var(--text);
}

.steps li {
  position: relative;
  min-height: 28px;
  margin: 10px 0 0;
  padding-left: 42px;
  line-height: 1.7;
}

.steps li::before {
  position: absolute;
  left: 0;
  top: 1px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid #bfd5ee;
  border-radius: 999px;
  background: #f7fbff;
  color: var(--primary-dark);
  content: counter(step);
  counter-increment: step;
  font-size: 13px;
  font-weight: 700;
}

.docs-section ul {
  margin: 0 0 14px;
  padding-left: 20px;
  color: var(--text);
  line-height: 1.8;
}

.example-line,
.code-card {
  margin: 12px 0 14px;
  padding: 12px 14px;
  border: 1px solid #d8e4f2;
  background: #f7fbff;
  color: var(--text-strong);
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 14px;
}

.code-card {
  overflow-x: auto;
}

.workflow-graphic,
.ui-mock {
  border: 1px solid #dce6f2;
  border-radius: 14px;
  background:
    radial-gradient(circle at top left, rgba(75, 137, 220, 0.1), transparent 34%),
    linear-gradient(180deg, #ffffff, #f8fbff);
  box-shadow: 0 10px 28px rgba(31, 57, 85, 0.08);
}

.workflow-graphic {
  display: grid;
  grid-template-columns: 1fr 34px 1fr 34px 1fr;
  align-items: center;
  gap: 8px;
  padding: 28px 22px;
}

.workflow-graphic span {
  display: grid;
  place-items: center;
  min-height: 76px;
  padding: 12px;
  border: 1px solid #d5e2f1;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
  color: var(--text-strong);
  font-weight: 700;
  text-align: center;
}

.workflow-graphic i {
  height: 2px;
  background: #9fb9da;
}

.workflow-graphic i::after {
  display: block;
  width: 8px;
  height: 8px;
  margin: -3px 0 0 auto;
  border-top: 2px solid #9fb9da;
  border-right: 2px solid #9fb9da;
  transform: rotate(45deg);
  content: "";
}

.ui-mock {
  min-height: 230px;
  padding: 20px;
}

.mock-caption {
  margin: 0 0 9px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mock-search {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding: 9px 9px 9px 13px;
  border: 1px solid #d5e0ed;
  border-radius: 8px;
  background: #fff;
  color: var(--text);
  font-family: Consolas, Monaco, "Courier New", monospace;
}

.mock-search span,
.download-mock i {
  padding: 7px 14px;
  border-radius: 7px;
  background: var(--primary);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-style: normal;
  font-weight: 700;
}

.mock-heatmap {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.mock-heatmap b {
  height: 30px;
  border-radius: 6px;
  background: #eef3f9;
}

.mock-heatmap .warm {
  background: #f2b18f;
}

.mock-heatmap .hot {
  background: #d96245;
}

.tissue-mock {
  display: flex;
  align-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
}

.tissue-mock .mock-caption {
  flex: 0 0 100%;
  margin: 4px 0 0;
}

.tissue-mock span,
.tissue-mock b {
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.tissue-mock span {
  padding: 7px 12px;
  border: 1px solid #bdd4ef;
  background: #f7fbff;
  color: var(--primary-dark);
}

.tissue-mock b {
  padding: 10px 16px;
  border: 1px solid rgba(217, 98, 69, 0.24);
  background: rgba(217, 98, 69, 0.09);
  color: #8d3d29;
}

.locus-mock {
  position: relative;
  min-height: 260px;
  background:
    linear-gradient(#e7edf5 1px, transparent 1px) 0 52px / 100% 54px,
    linear-gradient(90deg, #e7edf5 1px, transparent 1px) 48px 0 / 76px 100%,
    #fff;
}

.locus-mock strong,
.genotype-mock strong {
  position: absolute;
  left: 20px;
  top: 16px;
  color: var(--text-strong);
  font-size: 15px;
}

.locus-mock i {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #d96245;
  box-shadow: 16px 8px 0 #d96245, 28px 4px 0 #d96245, 42px 13px 0 #d96245;
}

.locus-mock span {
  position: absolute;
  left: 40px;
  right: 20px;
  bottom: 40px;
  height: 2px;
  background: #25364b;
}

.genotype-mock {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  gap: 22px;
  padding-top: 58px;
}

.geno-box {
  position: relative;
  min-height: 126px;
}

.geno-box span {
  position: absolute;
  left: 50%;
  bottom: var(--bottom);
  display: block;
  width: var(--box-width);
  height: var(--box-height);
  border: 2px solid #d96245;
  background: rgba(217, 98, 69, 0.12);
  transform: translateX(-50%);
}

.geno-box span::before {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: #d96245;
  content: "";
}

.geno-box span::after {
  position: absolute;
  left: 50%;
  top: calc(var(--whisker-top) * -1);
  bottom: calc(var(--whisker-bottom) * -1);
  width: 2px;
  background: #d96245;
  content: "";
  transform: translateX(-50%);
}

.geno-box::before,
.geno-box::after {
  position: absolute;
  left: 50%;
  width: var(--whisker-width);
  height: 2px;
  background: #d96245;
  content: "";
  transform: translateX(-50%);
}

.geno-box::before {
  bottom: calc(var(--bottom) + var(--box-height) + var(--whisker-top));
}

.geno-box::after {
  bottom: calc(var(--bottom) - var(--whisker-bottom));
}

.geno-box.low {
  --bottom: 36px;
  --box-width: 58px;
  --box-height: 30px;
  --whisker-width: 96px;
  --whisker-top: 16px;
  --whisker-bottom: 14px;
}

.geno-box.medium {
  --bottom: 28px;
  --box-width: 76px;
  --box-height: 52px;
  --whisker-width: 120px;
  --whisker-top: 26px;
  --whisker-bottom: 22px;
}

.geno-box.high {
  --bottom: 16px;
  --box-width: 92px;
  --box-height: 78px;
  --whisker-width: 146px;
  --whisker-top: 36px;
  --whisker-bottom: 30px;
}

.genotype-mock small {
  color: var(--muted);
  text-align: center;
}

.table-mock {
  display: grid;
  grid-template-columns: 0.8fr 1.15fr 0.9fr 0.9fr;
  align-content: start;
  gap: 0;
  padding: 18px;
}

.table-mock span,
.table-mock b {
  padding: 12px 10px;
  border-bottom: 1px solid #e6edf5;
  color: var(--text);
  font-size: 13px;
  text-align: left;
}

.table-mock span {
  color: var(--muted);
  font-weight: 700;
}

.table-mock b {
  font-weight: 500;
}

.download-mock {
  display: grid;
  align-content: center;
  gap: 12px;
}

.download-mock span {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.download-mock b {
  padding: 13px 14px;
  border: 1px solid #dfe8f3;
  border-radius: 8px;
  background: #fff;
  color: var(--text);
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  font-weight: 600;
}

.download-mock i {
  justify-self: start;
}

@media (max-width: 900px) {
  .docs-container {
    width: min(calc(100% - 32px), 1400px);
    padding: 16px 0 36px;
  }

  .docs-layout {
    grid-template-columns: 1fr;
  }

  .docs-nav {
    position: static;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    border-left: 0;
    border-top: 1px solid var(--border);
    padding: 12px 0 0;
  }

  .docs-nav::before,
  .docs-nav a::before,
  .docs-nav a.child::after {
    display: none;
  }

  .docs-nav a.child {
    margin-left: 0;
  }

  .child-section {
    margin-left: 0;
  }

  .guide-panel {
    grid-template-columns: 1fr;
  }

  .workflow-graphic {
    grid-template-columns: 1fr;
  }

  .workflow-graphic i {
    width: 2px;
    height: 28px;
    margin: 0 auto;
  }

  .workflow-graphic i::after {
    margin: 18px 0 0 -3px;
    transform: rotate(135deg);
  }
}
</style>
