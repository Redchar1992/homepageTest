<script type="text/javascript">
    export default {
        el: '#ff-corner',

        data() {
            return {
                trackType: "floatBanner",
                goTopStatus: 0,
                floatBannerStatus: 0,
                floatBannerData: {}
            }
        },

        methods: {
            gotoTop: function() {
                window.scroll(0,0);
                this.goTopStatus = 0;
            },

            closeBanner: function() {
                this.floatBannerStatus = 0;
            },

            getFloatBanner: function() {
                this.$http.get('../v2/json/floatBanner.json', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.floatBannerData = response.data;
                    if (this.floatBannerData.image) {
                        this.floatBannerStatus = 1;
                    }
                }, function(response) {
                });
            },

            snap: function(sessionChannelsOffset) {
                if (window.scrollY >= sessionChannelsOffset) {
                    this.goTopStatus = 1;
                } else {
                    this.goTopStatus = 0;
                }
            }
        },

        ready() {
            this.getFloatBanner();
            var that = this;
            var timeoutId = null;
            window.addEventListener("scroll", function() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                 }
                timeoutId = setTimeout(that.snap, 10, document.getElementById("ff-channels").offsetTop);
            });
        }
    };
</script>

<template>
    <div class="ff-corner" id="ff-corner">
        <div id="floatBanner" v-if="floatBannerStatus" class="floatBanner" :class="{'moveUp': goTopStatus == 1}">
            <a @click="gotoUrl(trackType, floatBannerData.url)">
                <img :src="floatBannerData.image">
            </a>
            <div class="closeBanner" @click="closeBanner"></div>
        </div>
        <div id="gotoTop" class="gotoTop" @click="gotoTop" transition="bounce" v-show="goTopStatus == 1"></div>
    </div>
</template>