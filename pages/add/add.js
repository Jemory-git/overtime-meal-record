import {
    formatTime,
    ajax,
    showMsg,
    baseUrl
} from "../../util/util.js";

Page({
    data: {
        datestart: '',
        dateend: '',
        date: '',
        money: '',
        shijianArray: ['早餐', '午餐', '晚餐', '其他'],
        shijianIndex: '2',
        items: [{
                value: '锦鑫'
            },
            {
                value: '俊航',
                checked: false
            },
            {
                value: '水美'
            },
            {
                value: '致威'
            },
            {
                value: '黄蜂'
            },
            {
                value: '上官'
            },
            {
                value: '海超'
            },
        ],
        radioItems: [{
                value: '未报',
                checked: true
            },
            {
                value: '已报'
            }
        ],
        selectedImgs: [],
        postData: {
            type: '晚餐',
            status: '未报',
            img_urls: []
        }
    },
    // 钩子
    onLoad() {
        let cdate = formatTime(new Date()).dateStr;
        this.setData({
            date: cdate
        });
        this.data.postData.date_time = cdate;

        // 打开分享功能
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    // 交互事件
    bindDateChange(e) {
        let v = e.detail.value;
        this.setData({
            date: v
        })

        // 保存至发送的数据中
        this.data.postData.date_time = v;
    },
    bindsjPickerChange(e) {
        let v = e.detail.value;
        this.setData({
            shijianIndex: v
        })

        // 保存至发送的数据中
        this.data.postData.type = this.data.shijianArray[v];
    },
    onmountinput(e) {
        this.checkNumberInput(e.detail.value);
    },
    bindImputBlur(e) {
        // 保存至发送的数据中
        this.data.postData.total = e.detail.value;
    },
    bindTextAreaBlur(e) {
        // 保存至发送的数据中
        this.data.postData.describe = e.detail.value;
    },
    checkboxChange(e) {
        // 保存至发送的数据中
        this.data.postData.names = e.detail.value;
    },
    radioChange(e) {
        let v = e.detail.value;
        // 保存至发送的数据中
        this.data.postData.status = v;
    },
    onsubmit() {
        console.log(wx.getStorageSync('password'));
        if (wx.getStorageSync('password') !== '13400657400') {
            // 密码不对
            wx.navigateTo({
                url: '/pages/password/password'
            })
            return;
        }
        // 密码正确，继续操作

        let postData = this.data.postData;
        if (this.checkInputValue(postData.date_time)) {
            showMsg.none_1500('请选择日期')
            return;
        }
        if (this.checkInputValue(postData.type)) {
            showMsg.none_1500('请选择时间')
            return;
        }
        if (this.checkInputValue(postData.total)) {
            showMsg.none_1500('请填写订单总额')
            return;
        }
        if (this.checkInputValue(postData.names)) {
            showMsg.none_1500('请填写加班人员')
            return;
        }
        if (this.checkInputValue(postData.status)) {
            showMsg.none_1500('请填写订单状态')
            return;
        }
        if (this.data.selectedImgs.length === 0) {
            showMsg.none_1500('请选择订单图片');
            return;
        }

        // 必填项都填了，提交图片
        this.uploadImg(0);
        // this.continue_submit();
    },
    continue_submit() {
        // ajax.post('/addRecord', this.data.postData).then((res) => {
        ajax.post('/v1/Foodcount/add_foodcount', this.data.postData).then((res) => {
            if (res.errcode != 0) {
                showMsg.modal_confirmCb_cancleCb('提交失败，是否重新提交', '提示', '否', '是').then(() => {
                    // 将图片地址处理成数组,然后重新提交
                    this.data.postData.img_urls = this.data.postData.img_urls.split(',');
                    this.onsubmit();
                }).then(() => {
                    return;
                })
                return;
            }
            showMsg.success('提交成功');
            // 清空当前输入
            this.setData({
                selectedImgs: [],
                money: ''
            })
            // 重置图片地址的数组,使得能继续提交
            this.data.postData.img_urls = [];
        })
    },
    selectimg() {
        let that = this;
        let restImg = 3 - that.data.selectedImgs.length;
        if (restImg <= 0) {
            showMsg.none_1500('最多选择3张图片');
            return;
        }
        wx.chooseImage({
            count: restImg,
            sizeType: ['original'],
            sourceType: ['album'],
            success(res) {
                let allImgArr = res.tempFilePaths;
                that.setData({
                    selectedImgs: that.data.selectedImgs.concat(allImgArr)
                })
            }
        })
    },
    // 自定义方法
    checkNumberInput(v) {
        let isNumber = parseInt(v);
        if (typeof isNumber !== 'number') {
            this.setData({
                money: ''
            })
            return;
        }
        this.setData({
            money: isNumber
        })
    },
    uploadImg(i) {
        let current_i = i;
        let next_i = i + 1;
        let selectedImgArr = this.data.selectedImgs;
        let len = selectedImgArr.length;

        if (current_i == len) {
            // 如果已经传完最后一张
            wx.hideLoading();
            // 将图片地址处理成要发送的数据形式
            if (this.data.postData.img_urls.length === 0) {
                showMsg.none_1500('图片上传成功后才能提交');
                return;
            }
            this.data.postData.img_urls = this.data.postData.img_urls.join(',');
            // 继续提交流程，添加其他数据
            this.continue_submit();
            return;
        }

        // 提示正在上传
        wx.showLoading({
            mask: true,
            title: `正上传图片${len}-${next_i}`
        })

        this.promise_upload(selectedImgArr[current_i]).then((data) => {
            if (data.errcode == 1) {
                showMsg.none_1500(data.errmsg);
                return;
            }
            // 上传成功保存图片地址
            this.data.postData.img_urls.push(data.data.picUrl);

            this.uploadImg(next_i);
        }).catch((data) => {
            wx.hideLoading();
            console.log(data);
            // 如果选择了一张以上图片，则可以跳过
            showMsg.modal_confirmCb_cancleCb({
                content: `第${next_i}张图片上传失败`,
                cancelText: len > 1 ? null : '取消'
            }).then(() => {
                // 当前图片上传失败，点击重新上传
                this.uploadImg(current_i);
            }).catch(() => {
                // 跳过这张,删除已选图片中的这一张
                // this.data.added_imgs.splice(current_i, 1);
                this.uploadImg(next_i);
            })
        })
    },
    promise_upload(src) {
        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url: baseUrl + '/v1/Foodcount/uploadPic',
                filePath: src,
                name: 'file',
                success(res) {
                    resolve(JSON.parse(res.data));
                },
                fail(res) {
                    reject(JSON.parse(res.data));
                }
            })
        })
    },
    checkInputValue(v) {
        if (v === '' || v === undefined) {
            return true
        }
        return false
    }
})