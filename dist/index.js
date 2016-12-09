'use strict';

require('./style.css');
var Touch = require('super-touch');
module.exports = {
    template: require('./template.html'),
    props: {
        slideplay: { //滑动播放
            type: Boolean,
            default: true
        },
        autoplay: { //自动播放
            type: Boolean,
            default: false
        },
        current: { //当前页面的index
            type: Number,
            default: 0
        },
        interval: { //自动切换时间间隔
            type: Number,
            default: 5000
        },
        duration: { //滑动动画时长
            type: Number,
            default: 1000
        },
        alternate: { //播放顺序,默认从左到右
            type: Boolean,
            default: false
        },
        change: { //每次更改调用的函数
            type: Function,
            default: function _default() {}
        },
        list: {
            type: Array,
            required: true
        }
    },
    computed: {
        size: function size() {
            return this.list.length;
        }
    },
    watch: {
        size: function size(val) {
            this.init();
        }
    },
    methods: {
        init: function init() {
            //当多个图片才初始化
            if (this.size > 1) {

                //初始化事件
                this.initEvent();

                //初始化滑动事件
                if (this.slideplay) {
                    this.initTouch();
                }

                //自动播放
                if (this.autoplay) {
                    this.isPlaying = true;
                    this.$group.style.webkitTransitionDuration = this.duration + 'ms';
                    this.delayPlay();
                }
            }
        },
        initTouch: function initTouch() {
            var _this = this;

            var touch = new Touch(this.$el);

            touch.on('touch:start', function (res) {
                res.e.preventDefault();
                _this.distinct = -_this.index * _this.width;
                _this.$group.style.webkitTransitionDuration = '0s';
                _this.stop();
            });

            touch.on('touch:move', function (res) {
                res.e.preventDefault();
                _this.move(res);
            });

            touch.on('touch:end', function (res) {
                res.e.preventDefault();
                _this.end(res);
            });

            touch.start();
        },
        initEvent: function initEvent() {
            var _this2 = this;

            //监听动画执行完毕,自动播放下一个
            this.$group.addEventListener('webkitTransitionEnd', function () {
                _this2.verifyMove();
                if (_this2.autoplay && _this2.isPlaying) {
                    _this2.delayPlay();
                }
                //通知父组件
                _this2.change(_this2.index);
            });
        },
        verifyMove: function verifyMove() {
            var move = function move(index) {
                var _this3 = this;

                var idx = index - this.size;
                this.$group.style.webkitTransitionDuration = '0s';
                this.translateX(this.$group, idx);
                this.index = Math.abs(idx);
                //更新过渡时间
                setTimeout(function () {
                    _this3.$group.style.webkitTransitionDuration = _this3.duration + 'ms';
                }, 0);
            };

            if (this.index >= this.size) {
                move.call(this, this.index);
            } else if (this.index <= -1) {
                move.call(this, 1);
            }
        },
        translateX: function translateX(el, count) {
            el.style.webkitTransform = 'translate3d(' + count * 100 + '%,0,0)';
        },
        play: function play() {
            var _this4 = this;

            //重新自动播放
            this.isPlaying = true;
            //异步更改过渡时间是为了让之前的时间生效
            setTimeout(function () {
                _this4.$group.style.webkitTransitionDuration = _this4.duration + 'ms';
            }, 0);
        },
        delayPlay: function delayPlay() {
            var _this5 = this;

            this.timeoutId = setTimeout(function () {
                _this5.alternate ? _this5.previous() : _this5.next();
                clearTimeout(_this5.timeoutId);
            }, this.interval);
        },
        stop: function stop() {
            //停止自动播放
            if (this.autoplay) {
                this.isPlaying = false;
                clearTimeout(this.timeoutId);
            }
        },
        goto: function goto(index) {
            this.translateX(this.$group, -index);
            this.index = index % (this.size + 1);
        },
        move: function move(res) {
            this.distinct -= res.xrange;
            this.$group.style.webkitTransform = 'translate3d(' + this.distinct + 'px,0,0)';
        },
        end: function end(res) {
            var _this6 = this;

            var dis = Math.abs(res.x1 - res.x2);
            var handler = function handler() {
                if (res.dir === 'left') {
                    _this6.next();
                } else if (res.dir === 'right') {
                    _this6.previous();
                }
            };

            this.$group.style.webkitTransitionDuration = '300ms';
            if (res.spend < 250 && dis > 30) {
                handler();
            } else if (dis < this.width / 2) {
                this.distinct = -this.index * this.width;
                this.$group.style.webkitTransform = 'translate3d(' + this.distinct + 'px,0,0)';
            } else {
                handler();
            }

            this.play();
        },
        previous: function previous() {
            this.goto(this.index - 1);
        },
        next: function next() {
            this.goto(this.index + 1);
        }
    },
    mounted: function mounted() {
        //是否是正在自动播放
        this.isPlaying = false;
        //执行的下标
        this.index = this.current;
        //setTimeout标示
        this.timeoutId = null;

        //元素的宽度
        this.width = this.$el.getBoundingClientRect().width || parseInt(getComputedStyle(this.$el).getPropertyValue('width'));
        //手滑动的距离
        this.distinct = 0;

        //获取元素
        // this.$wrapper = this.$el.querySelector('.swiper-wrapper');
        this.$group = this.$el.querySelector('.swiper-group');
        this.$items = this.$group.querySelectorAll('.swiper-item');

        this.$nextTick(function () {
            //初始化位置
            // this.goto(this.index);
            //启动
            this.init();
        });
    }
};