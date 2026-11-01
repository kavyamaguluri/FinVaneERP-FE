const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const baseUrl = isLocal ? 'http://localhost:8080/api/v2' : 'https://finvaneerp-be.onrender.com/api/v2';

export const environment = {
  production: !isLocal,
  apiBaseUrl: baseUrl,
  apiUrl: baseUrl,
  defaultTenantId: '1',
  currencySymbol: '₹',
  appName: 'FinVane ERP',
  version: 'v27.20-enterprise'
};
