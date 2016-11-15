require('./style.css');
var Vue = require('vue');
Vue.component('swiper', require('../src'));
new Vue({
    el: '#container',
    data: function () {
        return {
            list: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']
        }
    },
    methods: {
        change(index) {
            console.log(index);
        }
    }
});