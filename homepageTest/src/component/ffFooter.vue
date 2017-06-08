<script type="text/javascript">
    export default {
        el: '#ff-footer',

        data() {
            return {
                title: '在线反馈',
                contents: [
                    '京ICP备11011334号',
                    '版权所有 © 2016-2017 Mozilla Firefox Ltd.'
                ]
            }
        }
    };
</script>

<template>
    <section id="ff-footer" class="ff-footer">
        <h3>
            <a href="https://account.firefoxchina.cn/mfeedback.php">{{title}}</a>
        </h3>
        <p v-for="content in contents">{{content}}</p>
        <p></p>
    </section>
</template>