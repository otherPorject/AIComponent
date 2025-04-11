<template>
    <div
        class="drag-side"
        ref="dragSide"
        @mousedown.stop="mousedown"
        @click="handleClick"
        :style="{
            top: topRate + '%',
            left: leftRate + '%',
            'transition-duration': transitionDuration
        }"
    >
        <slot>
            <img src="../assets/avatar.png" alt="avatar" class="drag-side-avatar" />
        </slot>
    </div>
</template>

<script>
export default {
    props: {
        minRight: {
            type: Number,
            default: 90
        },
        minBottom: {
            type: Number,
            default: 80
        }
    },
    data() {
        return {
            leftRate: this.minRight,
            topRate: this.minBottom,
            transitionDuration: '0s'
        };
    },
    created() {
        let p = localStorage.getItem('gptIconPosition');
        if (p) {
            this.leftRate = JSON.parse(p).x;
            this.topRate = JSON.parse(p).y;
        } else {
            this.leftRate = this.minRight;
            this.topRate = this.minBottom;
        }
    },
    mounted() {
        let { width, height } = this.getRect();
        let leftPx = this.$refs.dragSide.getBoundingClientRect().left;
        let topPx = this.$refs.dragSide.getBoundingClientRect().top;
        if (leftPx < 0) {
            this.leftRate = 0;
        }
        if (document.body.offsetWidth - leftPx < width) {
            this.leftRate = ((document.body.offsetWidth - width) / document.body.offsetWidth) * 100;
        }
        if (topPx < 0) {
            this.topRate = 0;
        }
        if (window.innerHeight - topPx < height) {
            this.topRate = ((window.innerHeight - height) / window.innerHeight) * 100;
        }
        localStorage.setItem('gptIconPosition', JSON.stringify({ x: this.leftRate, y: this.topRate }));
    },
    methods: {
        handleClick() {
            this.$emit('handleClick');
        },
        // 获取dom相关属性(宽,高)
        getRect() {
            let dragSide = this.$refs.dragSide;
            return dragSide.getBoundingClientRect();
        },
        mousedown(e) {
            const that = this;
            let { width, height } = that.getRect();
            let start = new Date().getTime();
            let startX = e.clientX; // 鼠标初始位置
            let startY = e.clientY;
            let startELX = that.$refs.dragSide.getBoundingClientRect().left; // 元素初始位置
            let startELY = that.$refs.dragSide.getBoundingClientRect().top; // 元素初始位置
            let endX = 0; // 鼠标结束位置
            let endY = 0;
            let leftPx = '';
            let topPx = '';

            document.onmousemove = function (el) {
                that.$refs.dragSide.style.pointerEvents = 'none';
                endX = el.clientX;
                endY = el.clientY;
                leftPx = startELX + (endX - startX);
                topPx = startELY + (endY - startY);
                that.leftRate = (leftPx / document.body.offsetWidth) * 100;
                that.topRate = (topPx / window.innerHeight) * 100;
            };
            document.onmouseup = function () {
                that.$refs.dragSide.style.pointerEvents = null;
                let diff = new Date().getTime() - start;
                document.onmousemove = null;
                document.onmouseup = null;
                that.transitionDuration = '0.2s';
                if (leftPx < 0) {
                    that.leftRate = 0;
                }
                if (document.body.offsetWidth - leftPx < width) {
                    that.leftRate = ((document.body.offsetWidth - width) / document.body.offsetWidth) * 100;
                }
                if (topPx < 0) {
                    that.topRate = 0;
                }
                if (window.innerHeight - topPx < height) {
                    that.topRate = ((window.innerHeight - height) / window.innerHeight) * 100;
                }
                if (diff < 100 && (Math.abs(startX - endX) < 3 || Math.abs(startY - endY) < 3)) {
                    that.handleClick();
                }

                localStorage.setItem('gptIconPosition', JSON.stringify({ x: that.leftRate, y: that.topRate }));
                setTimeout(() => {
                    that.transitionDuration = '0s';
                }, 30);
            };
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                return false;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.drag-side {
    position: fixed;
    cursor: pointer;
    width: 40px;
    height: 40px;
    background-color: #3b82f6;
    padding: 2px;
    border-radius: 50%;
    z-index: 101;
    .drag-side-avatar {
        width: 40px;
        height: 40px;
    }
    &:hover {
        opacity: 0.8;
    }
}
</style>
