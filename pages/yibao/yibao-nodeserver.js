import {
    ajax,
    showMsg
} from "../../util/util.js";

Page({
    data: {
        list: [],
        weibaoAccount: ''
    },
    // 生命周期
    onLoad(e) {
        this.getData();

        // 打开分享功能
        wx.showShareMenu({
            withShareTicket: true
        })
    },

    // 交互事件
    onPullDownRefresh() {
        this.getData(() => {
            wx.stopPullDownRefresh();
        });
    },
    // 自定义方法
    getData(fn = function () {}) {
        ajax.post('/v1/Foodcount/weiyibao_info', {
            status: '已报'
        }).then((data) => {
            if (data.errcode == 1) {
                showMsg.none_1500(data.errmsg);
                return;
            }
            fn();
            // 给每一单加上status
            data.data.info.forEach(c => {
                c.status = data.data.status;
                c.imgArr = c.img_urls.split(',');
            });
            // 跟新视图
            this.setData({
                list: data.data.info,
                weibaoAccount: data.data.all_count
            })
        })
    }
})