'use strict';

require('./style.css');
var Touch = require('super-touch');
module.exports = {
    template: require('./template.html'),
    props: {
        slideplay: { //自动播放
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
            if (val) {
                this.play();
            }
        }
    },
    methods: {
        initTouch: function initTouch() {
            var _this = this;

            var touch = new Touch(this.$el);

            touch.on('touch:start', function (res) {
                res.e.preventDefault();
                //移动距离
                _this.distinct = 0;
                _this.stop();
            });

            touch.on('touch:move', function (res) {
                res.e.preventDefault();
                _this.move(res);
            });

            var delayTime = 0;
            touch.on('touch:end', function (res) {
                res.e.preventDefault();
                if (Date.now() - delayTime > _this.duration) {
                    _this.play();
                    _this.end(res);
                    delayTime = Date.now();
                }
            });

            touch.start();
        },
        initEvent: function initEvent() {
            var _this3 = this;

            var move = function move(index) {
                var _this2 = this;

                var idx = index - this.size;
                this.$group.style.webkitTransitionDuration = '0s';
                this.translateX(this.$group, idx);
                this.index = Math.abs(idx);
                //更新过渡时间
                setTimeout(function () {
                    _this2.$group.style.webkitTransitionDuration = _this2.duration + 'ms';
                }, 0);
            };
            //手动滑动
            this.$group.addEventListener('webkitTransitionEnd', function () {
                if (_this3.index === _this3.size) {
                    move.call(_this3, _this3.index);
                } else if (_this3.index === -1) {
                    move.call(_this3, 1);
                }

                _this3.change(_this3.index);
            });

            //监听动画执行完毕,自动播放下一个
            this.$group.addEventListener('webkitTransitionEnd', function () {
                if (_this3.autoplay && _this3.isPlaying) {
                    _this3.delayPlay();
                }
            });
        },
        translateX: function translateX(el, count) {
            el.style.webkitTransform = 'translate3d(' + count * 100 + '%,0,0)';
        },
        play: function play() {
            if (this.isPlaying) return;
            if (this.size && this.autoplay) {
                this.isPlaying = true;
                this.delayPlay();
            }
        },
        delayPlay: function delayPlay() {
            var _this4 = this;

            this.timeoutId = setTimeout(function () {
                _this4.alternate ? _this4.previous() : _this4.next();
                //消除iphone5s多次执行
                clearTimeout(_this4.timeoutId);
            }, this.interval);
        },
        stop: function stop() {
            this.isPlaying = false;
            clearTimeout(this.timeoutId);
        },
        goto: function goto(index) {
            this.translateX(this.$group, -index);
            this.index = index % (this.size + 1);
        },
        move: function move(res) {
            // this.distinct -= res.xrange;
            // this.$group.style.webkitTransform = 'translate3d(' + this.distinct + 'px,0,0)';
        },
        end: function end(res) {
            if (Math.abs(res.x1 - res.x2) < 50) return;
            if (res.dir === 'left') {
                this.next();
            } else if (res.dir === 'right') {
                this.previous();
            }
        },
        previous: function previous() {
            this.goto(this.index - 1);
        },
        next: function next() {
            this.goto(this.index + 1);
        }
    },
    mounted: function mounted() {
        this.isPlaying = false;
        //执行的下标
        this.index = this.current;
        //setTimeout标示
        this.timeoutId = null;

        //手滑动的距离
        this.distinct = 0;

        //获取元素
        this.$group = this.$el.querySelector('.swiper-group');
        this.$items = this.$group.querySelectorAll('.swiper-item');

        //初始化事件
        this.initEvent();

        if (this.slideplay) {
            this.initTouch();
        }

        this.$nextTick(function () {
            //初始化位置
            this.goto(this.index);
            //启动
            if (this.size && this.autoplay) {
                this.play();
            }
        });
    }
};