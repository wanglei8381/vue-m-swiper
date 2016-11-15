#vue-m-slider
 <h5>基于vue的移动端图片轮播</h5>
##Install
npm install vue-m-slider
##Use
<pre>
var Vue = require('vue');
Vue.component('slider', require('vue-m-slider'));
//在模版文件中使用,组件从距离顶部的位置开始, color样式颜色
//&lt;slider :list="list" src="name" link="code">&lt;/slider>

//通过props传值
props: {
    list: {//显示的数组,数组中对象格式是{src:'图片地址',link:'跳转地址'}
        type: Array,
        required: true
    },
    link: {//link的别名
        type: String,
        required: false,
        default: 'link'
    },
    src: {//src的别名
        type: String,
        required: false,
        default: 'src'
    },
    autoPlayDelay: {//自动播放延迟时间,0不自动播放
        type: Number,
        required: false,
        default: 2000
    },
    slideDuration: {//滑动的时间
        type: Number,
        required: false,
        default: 500
    }
}
</pre>