export const veGenesCache = new Map()
export const locusCache = new Map()
export const queryPairCache = new Map()
export const smrColocCache = new Map()

export const makeLocusCacheKey = ({ gene, tissue, window }) => (
  `${String(tissue || '').trim()}::${String(gene || '').trim().toUpperCase()}::${window}`
)

export const makeQueryPairCacheKey = ({ snp, gene, limit }) => (
  `${String(snp || '').trim().toLowerCase()}::${String(gene || '').trim().toUpperCase()}::${limit}`
)

export const makeSMRColocCacheKey = ({ trait, tissue, gene, topSNP, window, limit, center }) => (
  `${String(trait || '').trim()}::${String(tissue || '').trim()}::${String(gene || '').trim().toUpperCase()}::${String(topSNP || '').trim().toLowerCase()}::${window}::${limit || ''}::${center || ''}`
)
