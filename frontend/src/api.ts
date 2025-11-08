// src/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://flask-demo-188795468423.asia-east1.run.app/api', // ✅ 你 GCP 佈署的網址
  headers: { 'Content-Type': 'application/json' },
})
