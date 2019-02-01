
const baseUrl = "https://192.168.0.175"
// const baseUrl = "https://dev-miniapp.haotuoguan.cn"

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return {
    dateStr: [year, month, day].map(formatNumber).join('-'),
    timeStr: [hour, minute, second].map(formatNumber).join(':')
  }
}

const formatNumber = n => {
  // 个位数补零
  n = n.toString()
  return n[1] ? n : '0' + n
}

const ajax = {
  get(url, data, noLoading) {
    return new Promise((resolve, reject) => {
      if (!noLoading) {
        wx.showLoading({
          mask: true
        })
      }
      wx.request({
        url: baseUrl + url,
        data,
        header: {},
        method: 'GET',
        success: function (res) {
          resolve(res.data)
        },
        fail: function (res) {
          reject(res)
        },
        complete: function (res) {
          wx.hideLoading()
        },
      })
    })
  },
  post(url, data, headerObj, noLoading) {
    // 检查表单提交页提交时，content-type是json
    return new Promise((resolve, reject) => {
      if (!noLoading) {
        wx.showLoading({
          mask: true
        })
      }
      wx.request({
        url: baseUrl + url,
        data,
        header: Object.assign({}, {
            'content-type': 'application/x-www-form-urlencoded'
          },
          headerObj),
        method: 'POST',
        success: function (res) {
          resolve(res.data)
        },
        fail: function (res) {
          reject(res)
        },
        complete: function (res) {
          wx.hideLoading()
        },
      })

    })
  },
  chooseImg(options) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        ...options,
        success(res) {
          // 返回选定照片的本地文件路径列表和文件列表，filePath可以作为img标签的src属性显示图片
          resolve(res)
        },
        fail(res) {
          reject(res)
        }
      })
    })
  },
  uploadImg(options) {
    options.url = baseUrl + options.url;
    return new Promise((resolve, reject) => {
      let uploadTask = wx.uploadFile({
        ...options,
        success(res) { 
          // 返回包含data 和 statusCode
          resolve(res)
        },
        fail(res) {
          reject(res)
        },
        complete() {
          // wx.hideLoading();
        }
      })
      // 上传任务对象，可返回进度值
      // uploadTask.onProgressUpdate((res) => {
      //   console.log(res.progress);
      // })
    })
  }
}

const getStorageFn = function (key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  })
}

const checkUserInput = {
  isPhoneNumber(n) {
    return /^((13[0-9])|(14[4-8])|(15([0-3]|[5-9]))|(166)|(17[0|8])|(18[0-9]|(19[8|9])))\d{8}$/.test(n);
  },
  lengthIs_6(v) {
    if (v.length !== 6) {
      return false
    }
    return true
  }
}

const showMsg = {
  none_1500(msg) {
    wx.showToast({
      title: '' + msg,
      icon: 'none',
      duration: 1500
    })
  },
  success(msg) {
    wx.showToast({
      title: '' + msg,
      icon: 'success',
      duration: 1500
    })
  },
  modal_confirm_jcd(msg, fn = function () {}) {
    wx.showModal({
      title: '表单未完善',
      content: msg,
      showCancel: false,
      success(res) {
        fn();
      },
      fail(res) {
        console.log('模态框调用失败', res);
      }
    })
  },
  modal_confirm_cb(msg, fn = function () {}) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success(res) {
        fn();
      },
      fail(res) {
        console.log('模态框调用失败', res);
      }
    })
  },
  modal_confirmCb_cancleCb(content, title = '图片上传', cancelText = '跳过这张', confirmText = '重新上传') {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title,
        content,
        cancelText,
        confirmText,
        success(res) {
          if (res.confirm) {
            resolve();
          } else if (res.cancel) {
            reject();
          }
        },
        fail() {}
      })
    })
  }
}
const noSearchValue = (v) => {
  if (v === '' || v === null || v === undefined || v == false) {
    return true;
  }
  return false;
}

export {
  formatTime,
  ajax,
  getStorageFn,
  checkUserInput,
  showMsg,
  noSearchValue,
  baseUrl
}