require('./style.css');
var Vue = require('vue');
Vue.component('swiper', require('../src'));
new Vue({
    el: '#container',
    data: function () {
        return {
            list: [],
            index: 1
        }
    },
    methods: {
        change(index) {
            this.index = index + 1;
        },
        todo() {
            console.log('---->');
        }
    },
    mounted(){
        setTimeout(()=> {
            this.list = ['1.jpg', '2.jpg', '3.jpg', '4.jpg'];
        }, 1000);
    }
});