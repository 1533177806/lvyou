//app.js
App({
  api_root:"http://www.lvyou.com/",
  api_root2:"http://www.lvyou.com",
  onLaunch: function () {
    // 展示本地存储能力
    let _this = this;
      wx.login({
        success: res => {
           wx.request({
                    url: _this.api_root + "index.php/WxLogin/getopenId",
                    header: {
                      'content-type': 'application/json'
                    },
                    data:{code:res.code},
                    success:function(e){
                      if (e.statusCode !== 200) {
                        _this.showError('网络异常');
                        return false;
                      }
                      if(e.data!=null){
                        wx.setStorage({
                          data: e.data.openid,
                          key: 'openid',
                        })
                        wx.setStorage({
                          data: e.data,
                          key: 'userinfo',
                        })
                      }
                      var userinfo = wx.getStorageSync('userinfo');
                      if(userinfo==""||userinfo==null||userinfo==undefined){
                      //   _this.isLogin();
                      }
                    },
                    fail(e) {
                       _this.showError('网络异常');
                    }
          })
        }
      })
  },

  _get(url, data, success, fail, complete, check_login) {
        wx.showNavigationBarLoading();
        let _this = this;
        // 构造请求参数
        data = data || {};
        var openid = wx.getStorageSync('openid');
        if(openid){
          data.openid = openid;
        }
        // 构造get请求
        let request = function() {
          wx.request({
            url: _this.api_root + url,
            header: {
              'content-type': 'application/json'
            },
            data: data,
            success(res) {
              if (res.statusCode !== 200) {
                console.log(res);
                _this.showError('网络请求出错');
                return false;
              }
               success && success(res.data);
            },
            fail(res) {
              _this.showError(res.errMsg, function() {
                fail && fail(res);
              });
            },
            complete(res) {
              wx.hideNavigationBarLoading();
              complete && complete(res);
            },
          });
        };
        // 判断是否需要验证登录
        check_login ? _this.doLogin(request) : request();
  },

  _post_form(url, data, success, fail, complete, isShowNavBarLoading) {
    let _this = this;
    isShowNavBarLoading || true;
    data = data || {};
    var openid = wx.getStorageSync('openid');
    if(openid){
      data.openid = openid;
    }
    // 在当前页面显示导航条加载动画
    if (isShowNavBarLoading == true) {
      wx.showNavigationBarLoading();
    }
    wx.request({
      url: _this.api_root + url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      data: data,
      success(res) {
        if (res.statusCode !== 200 || typeof res.data !== 'object') {
          _this.showError('网络请求出错');
          return false;
        }
        if (res.data.code === -1) {
          // 登录态失效, 重新登录
          wx.hideNavigationBarLoading();
          _this.doLogin(1);
          return false;
        } else if (res.data.code === 0) {
          _this.showError(res.data.msg, function() {
            fail && fail(res);
          });
          return false;
        }
        success && success(res.data);
      },
      fail(res) {
        _this.showError(res.errMsg, function() {
          fail && fail(res);
        });
      },
      complete(res) {
        wx.hideNavigationBarLoading();
        // wx.hideLoading();
        complete && complete(res);
      }
    });
  },

  showSuccess(msg, callback) {
    wx.showToast({
      title: msg,
      icon: 'success',
      mask: true,
      duration: 1500,
      success() {
        callback && (setTimeout(function() {
          callback();
        }, 1500));
      }
    });
  },

  showError(msg, callback) {
    wx.showModal({
      title: '友情提示',
      content: msg,
      showCancel: false,
      success(res) {
        // callback && (setTimeout(function() {
        //   callback();
        // }, 1500));
        callback && callback();
      }
    });
  },
  imgList_str:function(list){
    var string = "";
    list.forEach(e => {
      string = string + e + "&";
    });
    return string;
  },
  globalData: {
    userInfo: null
  }
})
