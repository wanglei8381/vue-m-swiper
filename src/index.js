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
            this.init();
        }
    },
    methods: {
        init() {
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
        initTouch() {
            var touch = new Touch(this.$el);

            touch.on('touch:start', (res)=> {
                // res.e.preventDefault();
                this.distinct = -this.index * this.width;
                this.$group.style.webkitTransitionDuration = '0s';
                this.stop();
            });

            touch.on('touch:move', (res)=> {
                // res.e.preventDefault();
                this.move(res);
            });

            touch.on('touch:end', (res)=> {
                // res.e.preventDefault();
                this.end(res);
            });

            touch.start();
        },
        initEvent() {
            //监听动画执行完毕,自动播放下一个
            this.$group.addEventListener('webkitTransitionEnd', () => {
                this.verifyMove();
                if (this.autoplay && this.isPlaying) {
                    this.delayPlay();
                }
                //通知父组件
                this.change(this.index);
            });
        },
        verifyMove() {
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

            if (this.index >= this.size) {
                move.call(this, this.index);
            } else if (this.index <= -1) {
                move.call(this, 1);
            }
        },
        translateX(el, count) {
            el.style.webkitTransform = 'translate3d(' + count * 100 + '%,0,0)';
        },
        play() {
            //重新自动播放
            this.isPlaying = true;
            //异步更改过渡时间是为了让之前的时间生效
            setTimeout(()=> {
                this.$group.style.webkitTransitionDuration = this.duration + 'ms';
            }, 0);
        },
        delayPlay() {
            this.timeoutId = setTimeout(() => {
                this.alternate ? this.previous() : this.next();
                clearTimeout(this.timeoutId);
            }, this.interval);
        },
        stop() {
            //停止自动播放
            if (this.autoplay) {
                this.isPlaying = false;
                clearTimeout(this.timeoutId);
            }
        },
        goto(index) {
            this.translateX(this.$group, -index);
            this.index = index % (this.size + 1);
        },
        move(res) {
            this.distinct -= res.xrange;
            this.$group.style.webkitTransform = 'translate3d(' + this.distinct + 'px,0,0)';
        },
        end(res) {
            let dis = Math.abs(res.x1 - res.x2);
            let handler = () => {
                if (res.dir === 'left') {
                    this.next();
                } else if (res.dir === 'right') {
                    this.previous();
                }
            }

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
        previous() {
            this.goto(this.index - 1);
        },
        next() {
            this.goto(this.index + 1);
        }
    },
    mounted() {
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