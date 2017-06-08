<script type="text/javascript">
    export default {
        el: '#ff-header-right',

        data() {
            return {
                trackBannerType: "headerBanner",
                trackCommunityType: "headerCommunity",
                communityUrl: "http://mozilla.com.cn/moz-forum.html",
                headerBannerData: {}
            }
        },

        methods:{
            getBanner: function() {
                this.$http.get('../v2/json/headerBanner.json', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.headerBannerData = response.data;
                }, function(response) {
                });
            }
        },

        ready: function() {
            this.getBanner();
        }
    };
</script>

<template>
    <div class="ff-header-right" id="ff-header-right">
        <a @click="gotoUrl(trackBannerType, headerBannerData.url)" v-if="headerBannerData.image">
            <div class="header-banners-show">
                <img :src="headerBannerData.image">
            </div>
        </a>
        <a v-else @click="gotoUrl(trackCommunityType, communityUrl)">
            <div id="header-community" class="header-community">
                <img src="../../dist/images/community.png">
            </div>
        </a>
    </div>
</template>