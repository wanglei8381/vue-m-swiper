require('./style.styl');
let Touch = require('super-touch');
module.exports = {
    template: require('./template.html'),
    props: {
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
            type: Array
        }
    },
    computed: {
        size(){
            return this.list.length;
        }
    },
    methods: {
        initEvent() {
            var size = this.size;
            var step = this.alternate ? size : 0;
            //监听动画执行完毕,自动播放下一个
            this.$group.addEventListener('webkitTransitionEnd', () => {
                if (!this.isPlaying) return;
                this.timeoutId = setTimeout(() => {
                    if (this.count % size === 0) {
                        this.translateX(this.$content, this.count + step);
                    }
                    this.count++;
                    this.translateX(this.$group, -this.count);
                    var index = this.count % size;
                    this.index = index;
                    this.change(index);
                }, this.interval);
            });
        },
        translateX(el, count) {
            count = this.alternate ? -count : count;
            el.style.webkitTransform = 'translate3d(' + count * 100 + '%,0,0)';
        },
        play() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.timeoutId = setTimeout(() => {
                this.goto(this.index + 1);
            }, this.interval);
        },
        stop() {
            this.isPlaying = false;
            clearTimeout(this.timeoutId);
        },
        goto(index) {
            index = index % this.size;
            // index = index < 0 ? index + this.size : index;
            if (index == this.index) {
                return;
            }
            clearTimeout(this.timeoutId);
            // var step = this.interval ? 0 : this.size;
            this.translateX(this.$content, 0);
            this.$group.style.webkitTransitionDuration = '0s';
            this.translateX(this.$group, -this.index);

            setTimeout(() => {
                this.$group.style.webkitTransitionDuration = this.duration + 'ms';
                this.translateX(this.$group, -index);
                this.index = index;
                this.count = index;
                this.change(index);
            }, 0);
        },
        move(res) {
            this.distinct -= res.xrange;
            this.$group.style.webkitTransform = 'translate3d(' + this.distinct + 'px,0,0)';
        },
        end(res) {
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
        //播放次数
        this.count = 0;
        //执行的下标
        this.index = 0;
        //setTimeout标示
        this.timeoutId = null;

        //手滑动的距离
        this.distinct = 0;

        //获取元素
        this.$content = this.$el.querySelector('.swiper-content');
        this.$group = this.$el.querySelector('.swiper-group');
        this.$items = this.$group.querySelectorAll('.swiper-item');

        //初始化事件
        this.initEvent();

        //启动
        this.$nextTick(function () {
            if (this.size && this.autoplay) {
                // this.play();
            }
        });

        var touch = new Touch(this.$el);

        touch.on('touch:start', (res)=> {
            this.distinct = 0;
            res.e.preventDefault();
        });

        touch.on('touch:move', (res)=> {
            res.e.preventDefault();
            this.move(res);
        });

        touch.on('touch:end', (res)=> {
            res.e.preventDefault();
            this.end(res);
        });

        touch.start();
    }
};