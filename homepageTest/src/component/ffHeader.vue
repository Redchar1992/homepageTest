<script type="text/javascript">
    export default {
        el: '#ff-header',

        components: {
            "ffHeaderSearch": require('./ffHeaderSearch.vue'),
            "ffHeaderLeft": require("./ffHeaderLeft.vue"),
            'ffHeaderRight': require('./ffHeaderRight.vue'),
        }
    };
</script>

<template>
    <header id="ff-header" class="ff-header">
        <ff-header-left></ff-header-left>
        <ff-header-right></ff-header-right>
        <ff-header-search></ff-header-search>
    </header>
</template>