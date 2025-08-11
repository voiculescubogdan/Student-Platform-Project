import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false,
  minimum: 0.08,
  easing: 'ease-out',
  speed: 500,
  trickleSpeed: 200
})

const style = document.createElement('style')
style.innerHTML = `
  #nprogress .bar {
    background: #FF4500;
    height: 2px;
    transition: transform 0.5s ease-out, width 0.5s ease-out;
  }
  #nprogress .peg {
    box-shadow: 0 0 8px #FF4500, 0 0 4px #FF4500;
    transition: transform 0.5s ease-out, box-shadow 0.5s ease-out, opacity 0.5s ease-out;
  }
`
document.head.appendChild(style)

const api = axios.create({ 
  baseURL: 'http://localhost:3000'
})

api.interceptors.request.use(cfg => {
  NProgress.start()
  return cfg
}, e => { 
  NProgress.done()
  return Promise.reject(e)
})

api.interceptors.response.use(res => {
  NProgress.done()
  return res
}, err => {
  NProgress.done()
  return Promise.reject(err)
})

export default api