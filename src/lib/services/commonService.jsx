import axios from 'axios'

console.log(`${process.env.API_URL}:${process.env.API_PORT}/${process.env.API_BASE}`)
const client =axios.create( {
  baseURL:`${process.env.API_URL}:${process.env.API_PORT}/${process.env.API_BASE}`,
  validateStatus: (status) => status >= 200 && status < 300,
})
const commonHeaders={
    "Access-Control-Allow-Origin": "http://localhost:3000"
}
const baseService = async (options) => {
  const onSuccess = (response) => {
    return Promise.resolve(response)
  }
  const onError = (error) => {
    const errorResponse =
      error &&
      error.response &&
      error.response.data &&
      error.response.data.response
    if (errorResponse && typeof errorResponse !== 'undefined') {
      return Promise.reject(errorResponse.result)
    }
    return Promise.reject((error && error) || errorResponse.result)
  }
  try {
    const response = await client({ ...options,commonHeaders })
    return onSuccess(response)
  } catch (err) {
    return onError(err)
  }
}
export default baseService
