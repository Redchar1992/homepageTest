<script type="text/javascript">
    export default {
        el: '#ff-header-left',

        data() {
            return {
                trackType: "weather",
                weatherDetailUrl: "http://m.zuimeitianqi.com/weather_web/weather_web.html",
                weatherData: {},
                locationData: {},
                weatherConfig: {},
                weatherUIData: {
                    imgurl: '', temperature: '', city: '', quality: '', report: ''
                },
                showWeather: 0
            };
        },

        methods: {
            getLocation: function() {
                this.$http.jsonp('http://api.map.baidu.com/location/ip?ak=w2ec25c8b4xrfUGyMrlpZvXC&callback=handler', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.locationData = response.data;
                    this.getWeather();
                }, function(response) {
                });
            },

            getWeather: function() {
                if (!this.locationData || !this.locationData.address) {
                    return;
                }
                var address = this.locationData.address.split('|');
                var prams = "ProcCode=2059&appId=3&Uid=Firefox&province=" + address[1] +  "&cityName=" + address[2];
                var weatherUrl = "http://ext.zuimeitianqi.com/extDataServer/3.0/?p=" + encodeURIComponent(prams);
                this.$http.jsonp(weatherUrl, {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    if (response.data.data.length > 0) {
                        this.weatherData = response.data.data[0];
                        this.setWeatherUI();
                    }
                }, function(response) {
                });
            },

            setWeatherUI: function() {
                this.$http.get('../v2/json/weather.json', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.weatherConfig = response.data;
                    var weatherStr = this.weatherConfig[this.weatherData.actual.wea.toString()];
                    if (!weatherStr) {
                        return;
                    }
                    var curDate = new Date();
                    if (curDate.getHours() < 6 || curDate.getHours() > 18) {
                        this.weatherUIData["imgurl"] = weatherStr.night;
                    } else {
                        this.weatherUIData["imgurl"] = weatherStr.image;
                    }
                    this.weatherUIData["temperature"] = this.weatherData.actual.tmp + "°";
                    var address = this.locationData.address.split('|');
                    this.weatherUIData["city"] = address[2];
                    this.weatherUIData["quality"] = this.weatherData.air.aqigrad;
                    this.weatherUIData["report"] = '空气质量';
                    this.showWeather = 1;
                }, function(response) {
                    this.showWeather = 0;
                });
            }
        },

        ready() {
            var that = this;
            setTimeout(function() {
                that.getLocation();
            }, 5000);
        }
    };
</script>

<template>
    <div class="ff-header-left">
        <div id="header-logo" class="logo header-logo" :class="{'hover-logo': showWeather==1}">
            <div id="header-logo-img" class="logo-img">
                <img :src="">
            </div>
            <div class="logo-text">
                火狐主页
            </div> 
        </div>
        <div id="header-weather" class="logo header-weather" :class="{'hover-weather': showWeather==1}">
            <a @click="gotoUrl(trackType, weatherDetailUrl)">
                <div class="logo-img">
                    <img :src="weatherUIData.imgurl">
                </div>
                <div class="logo-text weather">
                    <p>
                        <span class="air-temperature">{{weatherUIData.temperature}}</span>
                        <span class="air-city">{{weatherUIData.city}}</span>
                    </p>
                    <p>
                        <span class="air-report">{{weatherUIData.report}}</span>
                        <span class="air-quality">{{weatherUIData.quality}}</span>
                    </p>
                </div>
            </a>
        </div>
    </div>
</template>