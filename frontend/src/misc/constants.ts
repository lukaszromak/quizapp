const prod = {
    url: {
      API_BASE_URL: 'http://localhost:80/api',
      STORAGE_BASE_URL: 'http://localhost:80/api'
    },
  }
  
  const dev = {
    url: {
      API_BASE_URL: 'http://localhost:8080/api',
      STORAGE_BASE_URL: 'http://localhost:8080/api'
    }
  }
  
  export const config = process.env.NODE_ENV === 'development' ? dev : prod