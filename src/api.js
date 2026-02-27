import axios from "axios"

const api = axios.create({
  baseURL: "https://movie-catalog-5baq.onrender.com"
})

export default api