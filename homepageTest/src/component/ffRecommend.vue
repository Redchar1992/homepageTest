<script type="text/javascript">
    export default {
        el: '#ff-recommend',

        data() {
            return {
                trackType: "recommend-",
                recommendData: []
            }
        },

        methods: {
            getRecommend: function() {
                var url = 'http://api.tepintehui.com/index.php?m=firefox&c=article&a=get_article&token=a60a09b9ecaf074bc1cf657a75e7007e';
                //var url = "http://api.tepintehui.com/index.php?m=firefox&c=article&a=get_article_dev&token=a60a09b9ecaf074bc1cf657a75e7007e";
                this.$http.jsonp(url, {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.recommendData = response.data;
                }, function(response) {
                });
            }
        },

        ready() {
            this.getRecommend();
        }
    };
</script>

<template>
    <section id="ff-recommend" class="ff-recommend">
        <div class="recommend-wrap" v-for="pdata in recommendData" track-by="$index" v-bind:class="{'last': $index == recommendData.length - 1}">
            <div class="recommend-title">
                <i class="recommend-icon">
                    <img :src="../../dist/images/title.png" style="width: 100%; height: 100%">
                </i>
                <span class="recommend-name">
                    <a @click="gotoUrl(trackType + pdata.title, pdata.url)" v-bind:class="{'lk-color': pdata.url.length > 0}">{{pdata.title}}</a>
                </span>
            </div>
            <div class="recommmend-content" v-for="data in pdata.data" track-by="$index" v-bind:class="{'last': $index == pdata.data.length - 1}">
                <a @click="gotoUrl(trackType + pdata.title, data.url)" v-if="data.image.length==1">
                    <div class="content-show-item single">
                        <div class="content-show-img">
                            <div class="show-img">
                                <img class="default-image" :src="data.image" @load="successLoadImg" @error="errorLoadImg">
                            </div>
                        </div>
                        <div class="content-show-text">
                            <div class="text-content">
                                <h3 class="text-title">
                                    <span class="text-tag" v-show="data.tag.length > 0">{{data.tag}}</span>
                                    {{data.title}}
                                    <span class="text-subtitle" v-show="data.subtitle.length > 0">{{data.subtitle}}</span>
                                </h3>
                                {{data.summary}}
                            </div>
                            <div class="text-coming">
                                <span class="ad" v-show="data.isAd == 1">广告</span>
                                <span class="pfrom">{{data.pfrom}}</span>
                                <span>{{data.ptime}}</span>
                            </div>
                        </div>
                    </div>
                </a>
                <a @click="gotoUrl(trackType + pdata.title , data.url)" v-else>
                    <div class="content-show-item" v-bind:class="{'noimage': data.image.length<1, 'multiple': data.image.length>1}">
                        <div class="content-show-text">
                            <h3 class="text-title single">{{data.title}}</h3>
                            <div class="content-show-img">
                                <div class="show-img" v-for="img in data.image">
                                    <img class="default-image" :src="img" @load="successLoadImg" @error="errorLoadImg">
                                </div>
                            </div>
                            <div class="text-detail" v-show="data.summary.length > 0">{{data.summary}}</div>
                            <div class="text-coming">
                                <span class="ad" v-show="data.isAd == 1">广告</span>
                                <span class="pfrom">{{data.pfrom}}</span>
                                <span>{{data.ptime}}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <div class="splitBar"></div>
    </section>
</template>