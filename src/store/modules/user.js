import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    // 新增将token和用户信息存储到localStorage中的操作
    localStorage.setItem('token', token)
  },
  // 删除原有的单独设置name和avatar功能，新增统一的用户信息存储功能
  SET_USER_INFO: (state, userInfo) => {
    state.name = userInfo.username
    state.avatar = userInfo.avatar
    localStorage.setItem('userInfo', userInfo)
  },
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
    // 新增清空localStorage的操作
    localStorage.clear()
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        // 此处根据后端的返回逻辑，将模板更改为从返回头中获取token
        const token = response.headers['authorization']
        const userInfo = response.data.data
        commit('SET_TOKEN', token)
        commit('SET_USER_INFO', JSON.stringify(userInfo))
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        /* const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)*/
        const userInfo = response.data.data
        commit('SET_USER_INFO', JSON.stringify(userInfo))
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

