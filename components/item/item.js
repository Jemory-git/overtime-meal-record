import {
    ajax,
    showMsg,
    getStorageFn
} from "../../util/util.js";
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        itemdata: Object
    },

    /**
     * 组件的初始数据
     */
    data: {
        passwordIsRight: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onBiaojiYibao(e) {
            console.log(wx.getStorageSync('password'));
            
            if (wx.getStorageSync('password') !== '13400657400') {
                // 密码不对
                wx.navigateTo({
                    url: '/pages/password/password'
                })
                return;
            }
            // 密码正确，继续操作

            let id = e.target.dataset.id;
            let postData = {
                order_number: id
            }
            showMsg.modal_confirmCb_cancleCb('确定此单已经报销吗？', '提示', '取消', '确定').then(() => {
                ajax.post('/v1/Foodcount/change_status', postData).then((data) => {
                    if (data.errcode == 1) {
                        showMsg.none_1500(data.errmsg);
                        return;
                    }
                    showMsg.success('标记成功');
                    setTimeout(() => {
                        this.triggerEvent('onclickyibao');
                    }, 1500);
                })
            }).catch(() => {
                return;
            })
        }
    },

})