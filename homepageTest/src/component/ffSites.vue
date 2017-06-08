<script type="text/javascript">
    export default {
        el: '#ff-sites',

        data() {
             return {
                 trackSitesType: "sites",
                 trackBannerType: "sitesBanner",
                 sitesBannerStatus: 0,
                 sitesBannerData: {},
                 ff_sitesData: [],
                 ff_pagesData: [],
                 curPageIndex: 0,
                 startX: 0,
                 startY: 0,
                 startTime: 0,
                 startTranslate: 0
             }
        },

        methods: {
            moveToPage: function(distance) {
                var sites = document.getElementById("sites-items");
                var touchDelta = distance + this.startTranslate;
                sites.style.transform = sites.style.webkitTransform = "translate(" + touchDelta + "px,0)";
            },

            slideToPage: function(distance, time) {
                var isSlide = true;
                var scrWidth = document.body.clientWidth;
                if (Math.abs(distance) < 50){
                    isSlide = false;
                } else {
                    if ((time < 1000 && distance > 0) ||
                        (time >= 1000 && distance > scrWidth/2)) {
                        this.curPageIndex --;
                    } else if ((time < 1000 && distance < 0) ||
                        (time >= 1000 && distance < -scrWidth/2)) {
                        this.curPageIndex ++;
                    }
                }
                this.changedPage(scrWidth);
                return isSlide;
            },

            resetSites: function() {
                // alert(0);
                var screenWidth = screen.width;
                var u = navigator.userAgent;
                var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
                if (isiOS && Math.abs(window.orientation) == 90) {
                    // alert(1);
                    screenWidth = screen.height;
                }
                this.convertDataToPage(screenWidth);
                if (this.curPageIndex >= this.ff_pagesData.length) {
                    this.curPageIndex = this.ff_pagesData.length - 1;
                }
                this.changedPage(screenWidth);
            },

            changedPage: function(screenWidth) {
                var sites = document.getElementById("sites-items");
                sites.style.transition = "transform 0.6s linear 0s";
                sites.style.webkitTransition = "-webkit-transform 0.6s linear 0s";
                sites.style.transform = sites.style.webkitTransform = "translate(-" + this.curPageIndex * screenWidth + "px,0)";
            },

            convertDataToPage: function(screenWidth) {
                if (this.ff_sitesData.length <= 0) {
                    return;
                }
                var linesInPage = 2;
                var itemsInLine;
                if (screenWidth < 320) {
                    itemsInLine = 3;
                } else if (screenWidth < 375) {
                    itemsInLine = 4;
                } else if (screenWidth < 768) {
                    itemsInLine = 5;
                } else if (screenWidth < 1024) {
                    itemsInLine = 6;
                } else if (screenWidth < 1280) {
                    itemsInLine = 7;
                } else {
                    itemsInLine = 8;
                }
                var pageNum = Math.ceil(this.ff_sitesData.length / (linesInPage * itemsInLine));
                this.ff_pagesData = [];
                for (var i = 0; i < pageNum; i ++) {
                    var start = i * linesInPage * itemsInLine;
                    var end = Math.min((i + 1) * linesInPage * itemsInLine, this.ff_sitesData.length);
                    var pagedata = this.ff_sitesData.slice(start, end);
                    this.ff_pagesData.push(pagedata);
                }
                this.setStyle(screenWidth);
            },

            getSites: function() {
                this.$http.get('../v2/json/sites.json', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.ff_sitesData = response.data;
                    this.convertDataToPage(document.body.clientWidth);
                    this.curPageIndex = 0;
                }, function(response) {
                    // handle error
                });
            },

            getSitesBanner: function() {
                var bannerUrl = "../v2/json/sitesBanner.json";
                if (this.isIOS) {
                    bannerUrl = "../v2/json/sitesBanner_ios.json"
                }
                this.$http.get(bannerUrl, {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.sitesBannerData = response.data;
                    if (this.sitesBannerData.image) {
                        this.sitesBannerStatus = 1;
                    }
                }, function(response) {
                    // handle error
                });
            },

            closeBanner: function() {
                this.sitesBannerStatus = 0;
            },

            setStyle: function(scrWidth) {
                var ffSites = document.getElementById("sites-items");
                ffSites.style.width = scrWidth * this.ff_pagesData.length + "px";
            },

            touchStartFunc: function(event) {
                event = window.event || event;
                this.startX = event.touches[0].screenX;
                this.startY = event.touches[0].screenY;
                this.startTime = new Date().getTime();
                var sites = document.getElementById("sites-items");
                var translate = sites.style.transform;
                sites.style.transition = sites.style.webkitTransition = "";
                if (!translate) {
                    translate = sites.style.webkitTransform;
                }
                if (translate) {
                    this.startTranslate = parseFloat(translate.toString().substring(10).split(',')[0]);;
                } else {
                    this.startTranslate = 0;
                }
            },

            touchMoveFunc: function(event) {
                event = window.event || event;
                var distanceX = event.touches[0].screenX - this.startX;
                var distanceY = event.touches[0].screenY - this.startY;
                if ((distanceX > 0 && this.curPageIndex <= 0) ||
                    (distanceX < 0 && this.curPageIndex >= this.ff_pagesData.length - 1) ||
                    Math.abs(distanceY) > Math.abs(distanceX)) {
                    return;
                }
                event.preventDefault();
                this.moveToPage(distanceX);
            },

            touchEndFunc: function(event) {
                event = window.event || event;
                var distanceX = event.changedTouches[0].screenX - this.startX;
                var distanceY = event.changedTouches[0].screenY - this.startY;
                if ((distanceX > 0 && this.curPageIndex <= 0) ||
                    (distanceX < 0 && this.curPageIndex >= this.ff_pagesData.length - 1) ) {
                    return;
                }
                var time = new Date().getTime() - this.startTime;
                if (this.slideToPage(distanceX, time)) {
                    event.preventDefault();
                }
            }
        },

        ready: function() {
            var that = this;
            this.getSites();
            this.getSitesBanner();
            var oldOrientation = window.orientation;
            window.addEventListener("orientationchange", function(event) {
                if (Math.abs(oldOrientation) + Math.abs(window.orientation) != 180) {
                    that.resetSites();
                }
                oldOrientation = window.orientation;
            });
        }
    };
</script>

<template>
   <div class="ff-sites">
        <div id="sites-items" class="sites-items" draggable="true" @touchstart="touchStartFunc" @touchend="touchEndFunc" @touchmove="touchMoveFunc">
            <div class="sites-page" v-for="pagesData in ff_pagesData" track-by="$index" :class="{'active': $index==0}">
                <div class="sites-item" v-for="item in pagesData">
                    <a class="sites-url" @click="gotoUrl(trackSitesType, item.url)">
                        <div class="icon-sites" >
                            <img class="default-image" :src="item.image" @load="successLoadImg" @error="errorLoadImg">
                        </div>
                        <p class="sites-name">{{item.name}}</p>
                    </a>
                </div>
            </div>
        </div>
        <div class="sites-points">
                <span class="pt" v-for="pagesData in ff_pagesData" track-by="$index" :class="{'active': $index==curPageIndex}"></span>
        </div>
        <div id="sitesBanner" v-if="sitesBannerStatus" class="sitesBanner">
            <a @click="gotoUrl(trackBannerType, sitesBannerData.url)">
                <img :src="sitesBannerData.image">
            </a>
            <div class="closeBanner" @click="closeBanner"></div>
        </div>
    </div>
</template>