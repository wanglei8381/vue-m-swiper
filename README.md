#vue-m-slider
 <h5>基于vue的移动端图片轮播</h5>
##Install
npm install vue-m-swiper
##Use
<pre>
var Vue = require('vue');
Vue.component('swiper', require('vue-m-swiper'));
//在模版文件中使用
&lt;swiper :list="list" :autoplay="true">&lt;/swiper>
</pre>

###Params
####list
<pre>
Type : Array
图片的地址['//img','//img',...]
</pre>
####slideplay
<pre>
Type : Boolean
Default: true
手动滑动播放
</pre>
####autoplay
<pre>
Type : Boolean
Default: false
自动播放
</pre>
####alternate
<pre>
Type : Boolean
Default: false
自动播放的顺序,默认从左到右
</pre>
####current
<pre>
Type : Number
Default : 0
初始指定的下标
</pre>
####interval
<pre>
Type : Number
Default : 5000
自动切换时间间隔
</pre>
####duration
<pre>
Type : Number
Default : 1000
滑动动画时长
</pre>
####change
<pre>
Type : Function
每次更改调用的函数
参数是当前下标,从0开始
</pre>