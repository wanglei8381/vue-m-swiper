require('./style.css');
let Touch = require('super-touch');
module.exports = {
    template: require('./template.html'),
    props: {
        slideplay: {//滑动播放
            type: Boolean,
            default: true
        },
        autoplay: {//自动播放
            type: Boolean,
            default: false
        },
        current: {//当前页面的index
            type: Number,
            default: 0
        },
        interval: {//自动切换时间间隔
            type: Number,
            default: 5000
        },
        duration: {//滑动动画时长
            type: Number,
            default: 1000
        },
        alternate: {//播放顺序,默认从左到右
            type: Boolean,
            default: false
        },
        change: {//每次更改调用的函数
            type: Function,
            default: function () {
            }
        },
        list: {
            type: Array,
            required: true
        }
    },
    computed: {
        size(){
            return this.list.length;
        }
    },
    watch: {
        size(val){
            if (val) {
                this.play();
            }
        }
    },
    methods: {
        initTouch() {
            var touch = new Touch(this.$el);

            touch.on('touch:start', (res)=> {
                res.e.preventDefault();
                this.$wrapper.style.webkitTransitionDuration = '0s';
                this.stop();
            });

            touch.on('touch:move', (res)=> {
                res.e.preventDefault();
                this.move(res);
            });

            var delayTime = 0;
            touch.on('touch:end', (res)=> {
                res.e.preventDefault();
                this.distinct = -parseInt(this.width);
                this.$wrapper.style.webkitTransitionDuration = this.duration + 'ms';
                this.$wrapper.style.webkitTransform = 'translate3d(' + this.distinct + 'px,0,0)';
                if (Date.now() - delayTime > this.duration) {
                    this.play();
                    this.end(res);
                    delayTime = Date.now();
                }
            });

            touch.start();
        },
        initEvent() {

            var move = function (index) {
                var idx = index - this.size;
                this.$group.style.webkitTransitionDuration = '0s';
                this.translateX(this.$group, idx);
                this.index = Math.abs(idx);
                //更新过渡时间
                setTimeout(()=> {
                    this.$group.style.webkitTransitionDuration = this.duration + 'ms';
                }, 0);
            }
            //手动滑动
            this.$group.addEventListener('webkitTransitionEnd', () => {
                if (this.index === this.size) {
                    move.call(this, this.index);
                } else if (this.index === -1) {
                    move.call(this, 1);
                }

                this.change(this.index);
            });

            //监听动画执行完毕,自动播放下一个
            this.$group.addEventListener('webkitTransitionEnd', () => {
                if (this.autoplay && this.isPlaying) {
                    this.delayPlay();
                }
            });
        },
        translateX(el, count) {
            el.style.webkitTransform = 'translate3d(' + count * 100 + '%,0,0)';
        },
        play() {
            if (this.isPlaying) return;
            if (this.size && this.autoplay) {
                this.isPlaying = true;
                this.delayPlay();
            }
        },
        delayPlay() {
            this.timeoutId = setTimeout(() => {
                this.alternate ? this.previous() : this.next();
                //消除iphone5s多次执行
                clearTimeout(this.timeoutId);
            }, this.interval);
        },
        stop() {
            this.isPlaying = false;
            clearTimeout(this.timeoutId);
        },
        goto(index) {
            this.translateX(this.$group, -index);
            this.index = index % (this.size + 1);
        },
        move(res) {
            this.distinct -= res.xrange * 0.5;
            this.$wrapper.style.webkitTransform = 'translate3d(' + this.distinct + 'px,0,0)';
        },
        end(res) {
            if (Math.abs(res.x1 - res.x2) < 100) return;
            if (res.dir === 'left') {
                this.next();
            } else if (res.dir === 'right') {
                this.previous();
            }
        },
        previous() {
            this.goto(this.index - 1);
        },
        next() {
            this.goto(this.index + 1);
        }
    },
    mounted() {
        this.isPlaying = false;
        //执行的下标
        this.index = this.current;
        //setTimeout标示
        this.timeoutId = null;

        this.width = getComputedStyle(this.$el).getPropertyValue('width');
        //手滑动的距离
        this.distinct = -parseInt(this.width);

        //获取元素
        this.$wrapper = this.$el.querySelector('.swiper-wrapper');
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