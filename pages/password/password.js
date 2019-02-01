Page({
    oninput(e) {},
    onconfirm(e) {
        let v = e.detail.value;
        console.log(v);
        wx.setStorageSync('password', v);
        wx.navigateBack({
            delta: 1
        })
    }
})