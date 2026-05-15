// src/api.js
import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check whether the backend service is running.'
    } else if (error.message === 'Network Error') {
      error.message = `Network error: unable to connect to backend service (${API_BASE_URL}).`
    } else if (error.response) {
      error.message = error.response.data?.detail || error.response.statusText
    }
    return Promise.reject(error)
  }
)

export const fetchGeneData = (symbol) => api.get(`/gene/${symbol}`)
export const fetchVeQTLData = (symbol) => api.get(`/veqtl/${symbol}`)
export const getTraitsSMR = (params) => api.get('/traits/smr', { params })
export const fetchSMRColoc = (params) => api.get('/traits/smr/coloc', { params })
export const querySNP = (snpId, params) => api.get(`/query/snp/${snpId}`, { params })
export const queryGene = (geneSymbol, params) => api.get(`/query/gene/${geneSymbol}`, { params })
export const queryPair = (params) => api.get('/query/pair', { params })
export const fetchGenotypeEffect = (params) => api.get('/expression/genotype-effect', { params })
export const fetchLocus = (params) => api.get('/locus', { params })
export const fetchGeneSuggestions = (params) => api.get('/locus/genes/suggest', { params })
export const fetchTopGenes = (tissue, params) => api.get(`/tissue/${tissue}/top-genes`, { params })
export const fetchDownloads = () => api.get('/downloads')
