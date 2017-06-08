<script type="text/javascript">
    export default {
        el: '#ff-channels',
        data() {
            return {
                trackType: "channels-",
                touchData: {
                    startX: 0,
                    startY: 0,
                    startTranslate: 0
                },
                channelTitles: [],
                channelDataList: [],
                channelTitlesFirstLine: [],
                channelTitlesMenu: [],
                channelTitlesIndex: -1,
                curChannelIndex: -1,
                curChannelMenuIndex:-1,
                bannersData: [],
                loadText: {
                    info: "",
                    action: "加载更多"
                },
                maxImage: 3,
                maxItemsNum: 150,
                itemsInPage: 10,
                loadBarStatus: {
                    loading: 0,
                    nomore: 1,
                    error: 2,
                    loaded: 3,
                    default: 4
                },
                floatChannelsTitle: 0,
                screenWidth: screen.width
            }
        },

        watch: {
            curChannelIndex: function(val) {
                this.gotoUrl(this.trackType + this.channelTitlesFirstLine[val].channelName, null);
                var sessionChannels = document.getElementById("ff-channels");
                this.channelTitlesIndex = val;
                if (this.channelDataList[val].length <= 0 && this.channelTitlesFirstLine[val].loadBarStatus != this.loadBarStatus.loading) {
                    if (window.scrollY > sessionChannels.offsetTop) {
                        window.scroll(0, sessionChannels.offsetTop);
                    }
                    var fromMozillaOnline = (val == 0);
                    this.getChannelData(val, fromMozillaOnline);
                }
            },

            curChannelMenuIndex: function(val) {
                this.channelTitlesIndex = val + this.channelTitlesFirstLine.length;
                this.gotoUrl(this.trackType + this.channelTitlesMenu[val].channelName, null);
                var index = this.channelTitlesFirstLine.length - 1;
                if (this.channelDataList[index].length <= 0 && this.channelTitlesFirstLine[index].loadBarStatus != this.loadBarStatus.loading) {
                     this.getChannelData(index, false);
                }
            }
        },

        methods: {
            touchstartContent(event) {
                event = window.event || event;
                this.touchData.startX = event.touches[0].screenX;
                this.touchData.startY = window.scrollY;
            },

            touchendContent(event) {
                event = window.event || event;
                var distanceX = event.changedTouches[0].screenX - this.touchData.startX;
                var distanceY = window.scrollY - this.touchData.startY;
                if ((distanceX > 0 && this.curChannelIndex <= 0) ||
                    (distanceX < 0 && this.curChannelIndex >= this.channelDataList.length - 1) ||
                    Math.abs(2*distanceY) > Math.abs(distanceX) ||
                    Math.abs(distanceX) < 50) {
                    return;
                }
                event.preventDefault();
                if (distanceX > 0) {
                    this.setLoadBar(this.curChannelIndex - 1);
                    this.curChannelIndex--;
                } else {
                    this.setLoadBar(this.curChannelIndex + 1);
                    this.curChannelIndex++;
                }
            },

            resetTitle: function() {
                console.log("旋转");
                var channelTitle = document.getElementsByClassName("channel-title");
                if (channelTitle.length <= 0) {
                    return;
                }
                var screenWidth = screen.width;
                
                if (this.isIOS && Math.abs(window.orientation) == 90) {
                    screenWidth = screen.height;
                }
                
                this.resetTitleWidth(this.screenWidth);
            },

            changeLastTitleStatus: function() {

                var channelPulldownMenu = document.getElementById("nav-pulldownmenu");
                channelPulldownMenu.style.display = "none";

                var pulldownButton = document.getElementById("channel-pulldown-button");
                pulldownButton.style.transform = "rotate(0deg)"
                pulldownButton.style.webkitTransform = "rotate(0deg)"

            },

            clickHandler: function(index, channelName) {
                if (channelName == "全部") {
                    this.clickPulldownButton();
                    return;
                }
                this.changeLastTitleStatus();
                if (this.curChannelMenuIndex >= 0) {
                    this.channelTitlesFirstLine.splice(-1, 1, this.channelTitlesMenu[this.curChannelMenuIndex]);
                } else {
                    this.channelTitlesFirstLine.splice(-1, 1, {"channelName": "全部"});
                }
                if (this.curChannelIndex == index) {
                    return;
                }
                this.setLoadBar(index);
                this.curChannelIndex = index;
                this.channelTitlesIndex = index;
            },

            clickChannelPulldownMenuHandler: function(index, channelName) {
                this.changeLastTitleStatus();

                this.channelTitlesFirstLine.splice(-1, 1, this.channelTitlesMenu[index]);
                 if (this.curChannelMenuIndex == index) {
                    this.curChannelIndex = this.channelTitlesFirstLine.length - 1;
                    return;
                }
                this.curChannelMenuIndex = index;
                this.channelTitlesIndex = index + this.channelTitlesFirstLine.length;

                var i = this.channelTitlesFirstLine.length - 1;
                this.channelTitlesFirstLine[i]["pageNum"] = 0;
                this.channelTitlesFirstLine[i]["loadedItems"] = 0;
                this.channelTitlesFirstLine[i]["loadBarStatus"] = this.loadBarStatus.default;

                var data = [];
                if (this.channelDataList.length == this.channelTitlesFirstLine.length) {
                    this.channelDataList.pop();
                }
                this.channelDataList.push(data);

                this.setLoadBar(i);
                this.curChannelIndex = i;

            },

            clickPulldownButton: function() {
                var pulldownButton = document.getElementById("channel-pulldown-button");
                if (pulldownButton.style.transform == "rotate(0deg)" || pulldownButton.style.webkitTransform == "rotate(rotate(0deg))") {
                    pulldownButton.style.transform = "rotate(180deg)"
                    pulldownButton.style.webkitTransform = "rotate(180deg)"
                } else {
                    pulldownButton.style.transform = "rotate(0deg)"
                    pulldownButton.style.webkitTransform = "rotate(0deg)"
                }

                var channelPulldownMenu = document.getElementById("nav-pulldownmenu");
                channelPulldownMenu.style.display = (channelPulldownMenu.style.display == "none"?"block":"none");

                // last channel item title handler 
                if (this.channelTitlesFirstLine[this.channelTitlesFirstLine.length - 1].channelName == "收起") {

                    if (this.curChannelMenuIndex >= 0) {
                        this.channelTitlesFirstLine.splice(-1, 1, this.channelTitlesMenu[this.curChannelMenuIndex]);
                    } else {
                        this.channelTitlesFirstLine.splice(-1, 1, {"channelName": "全部"});
                    }
                } else {
                    this.channelTitlesFirstLine.splice(-1, 1, {"channelName": "收起"});
                }
            },

            resetTitleWidth: function(screenWidth){
                // alert(screenWidth);
                var channelTitle = document.getElementsByClassName('channel-title');
                var width;
                var u = navigator.userAgent;
                    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
                if (screenWidth < 320) {
                    width = "25%";
                } else if (screenWidth < 375) {
                    width = "20%";
                } else if (screenWidth < 768) {
                    // if(isIOS && screenWidth < 414){
                    //     width = "20%";
                    // }
                    // else{
                        width = "16.666667%";
                    // }
                } else if (screenWidth < 1024) {
                    width = "14.285714%";
                } else if (screenWidth < 1280) {
                    // if(isIOS){
                    //     width = "14.285714%";
                    // }
                    // else{
                        width = "12.5%";
                    // }
                } else {
                    width = "11.11111%";
                }
                for(var i=0;i<channelTitle.length;i++){
                    channelTitle[i].style.width = width;
                }
            },

            convertTitleDataToLines: function(screenWidth) {
                if (this.channelTitles.length <= 0) {
                    return;
                }
                console.log("screenWidth" , screenWidth);
                console.log("screen.width ", screen.width);
                var channelTitlesArray = this.channelTitles;
                var channelTitlesMenu;
                var itemsInLine;
                if (screenWidth < 320) {
                    itemsInLine = 4;
                } else if (screenWidth < 375) {
                    itemsInLine = 5;
                } else if (screenWidth < 768) {
                    itemsInLine = 6;
                } else if (screenWidth < 1024) {
                    itemsInLine = 7;
                } else if (screenWidth < 1280) {
                    itemsInLine = 8;
                } else {
                    itemsInLine = 9;
                }
                this.channelTitlesFirstLine = channelTitlesArray.slice(0,itemsInLine - 1);
                this.channelTitlesMenu = channelTitlesArray.slice(itemsInLine - 1);

                if (this.channelTitlesFirstLine.length < this.channelTitles.length) {
                    this.channelTitlesFirstLine.push({"channelName": "全部"});
                }

                // convert channel data list 
                for(var i = 1; i < this.channelTitlesFirstLine.length; i++) {
                    var data = [];
                    this.channelDataList.push(data);
                }
            },

            getTitleData() {
                this.$http.get('../v2/json/channels.json', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    this.channelTitles = response.data;
                    if (this.channelTitles.length <= 0) {
                        return;
                    }
                    for (var i=0; i<this.channelTitles.length; i++) {
                        var name = this.channelTitles[i].channelName;
                        this.channelTitles[i]["pageNum"] = 0;
                        this.channelTitles[i]["loadedItems"] = 0;
                        this.channelTitles[i]["loadBarStatus"] = this.loadBarStatus.default;
                    }
                    this.curChannelIndex = 0;
                    this.convertTitleDataToLines(screen.width);
                }, function(response) {
                });
            },

            getChannelData: function(index, fromMozillaOnline) {
                var channelIndex = index;
                this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.loading;
                this.setLoadBar(channelIndex);
                this.channelTitlesFirstLine[channelIndex].loadedItems = 0;
                if (fromMozillaOnline) {
                    this.getChannelDataFromMozillaOnline();
                    return;
                }
                // Set the url to content provider
                switch (this.channelTitlesFirstLine[channelIndex].sourceId) {
                    case "101": //sina
                        this.getChannelDataFromSina(channelIndex);
                        break;
                    case "102": //163
                        this.getChannelDataFrom163(channelIndex);
                        break;
                    case "103": //迷彩虎 
                        this.getChannelDataFromMiCai(channelIndex);
                        break;
                    case "104": // 秒拍
                        this.getChannelDataFromMiaopai(channelIndex);
                        break;
                    default:
                        this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.error;
                        this.setLoadBar(channelIndex);
                        break;
                }
            },

            setLoadBar: function(index) {
                // 0: loading
                // 1: nomore
                // 2: error
                // 3: loaded
                // 4: default
                var that = this;
                var channelIndex = index;
                var channelsLoadMore = document.getElementsByClassName("ff-channels-loadMore")[channelIndex];
                var clickLoadMore = document.getElementsByClassName("clickLoadMore")[channelIndex];
                var channelLoading = document.getElementsByClassName("channelLoading")[channelIndex];
                switch (this.channelTitlesFirstLine[channelIndex].loadBarStatus) {
                    case 0:
                        channelLoading.style.display = "block";
                        clickLoadMore.style.display = "none";
                        break;
                    case 1:
                        this.loadText.info = "无更多内容";
                        this.loadText.action = "";
                        clickLoadMore.onclick = null;
                        channelLoading.style.display = "none";
                        clickLoadMore.style.display = "block";
                        break;
                    case 2:
                        this.loadText.info = "";
                        this.loadText.action = "重新加载";
                        clickLoadMore.onclick = function () {
                            var fromMozillaOnline = (channelIndex == 0 && that.channelDataList[channelIndex].length <= 0);
                            that.getChannelData(channelIndex, fromMozillaOnline);
                        };
                        channelLoading.style.display = "none";
                        clickLoadMore.style.display = "block";
                        break;
                    case 3:
                        channelLoading.removeAttribute("style");
                        this.loadText.info = "";
                        this.loadText.action = "加载更多";
                        clickLoadMore.onclick = function () {
                            that.getChannelData(channelIndex, false);
                        };
                        channelLoading.style.display = "none";
                        clickLoadMore.style.display = "block";
                        break;
                    case 4:
                    default:
                        var sessionFooter = document.getElementById("ff-footer");
                        var contentNav = document.getElementById("navdrag");
                        var contentWrap = document.getElementById("content-wrap");
                        var paddingHeight = document.body.clientHeight  - parseInt(document.defaultView.getComputedStyle(sessionFooter,null).height) - parseInt(document.defaultView.getComputedStyle(contentNav,null).height) - parseInt(document.defaultView.getComputedStyle(contentNav,null).marginTop) - parseInt(document.defaultView.getComputedStyle(contentWrap,null).marginBottom) - parseInt(document.defaultView.getComputedStyle(channelsLoadMore,null).marginTop);
                        channelLoading.style.height = paddingHeight + "px";
                        channelLoading.style.display = "block";
                        clickLoadMore.style.display = "none";
                        break;
                }
            },

            convertDataFromSina: function (index, data) {
                var repeated = true;
                var repeatedDataLength = this.channelDataList[index].length;
                for (var i=0; i<data.length; i++) {
                    if (repeated && this.checkRepeated(index, repeatedDataLength, data[i])) {
                        continue;
                    }
                    repeated = false;
                    this.channelTitlesFirstLine[index].loadedItems++;
                    var itemData = {
                        layout: 0,
                        pfrom: data[i].source,
                        ptime: data[i].cTime,
                        title: data[i].longTitle,
                        summary: data[i].summary.replace(/\s/g, ""),
                        url: data[i].url,
                        image: [],
                        isAd: 0
                    };
                    if (itemData.title == "") {
                        itemData.title = data[i].title;
                    }
                    if (itemData.pfrom == "") {
                        itemData.pfrom = this.channelTitlesFirstLine[index].sourceName;
                    }
                    if (data[i].imgs.length == 0 && data[i].mainPic != "") {
                        itemData.image.push(data[i].mainPic);
                    } else {
                        for (var j=0; j<data[i].imgs.length && j<this.maxImage; j++) {
                            itemData.image.push(data[i].imgs[j]);
                        }
                    }
                    this.channelDataList[index].push(itemData);
                }
                if (this.channelTitlesFirstLine[index].loadedItems < this.itemsInPage) {
                    this.getChannelDataFromSina(index);
                    return;
                }
                if (this.channelDataList[index].length >= this.maxItemsNum ) {
                    this.channelTitlesFirstLine[index].loadBarStatus = this.loadBarStatus.nomore;
                } else {
                    this.channelTitlesFirstLine[index].loadBarStatus = this.loadBarStatus.loaded;
                }
            },

            getChannelDataFromSina: function(index) {
                var channelIndex = index;
                var page = this.channelTitlesFirstLine[channelIndex].pageNum + 1;
                var url = 'http://interface.sina.cn/qudao/firefox/list.d.html?wm=3298&channel=' + this.channelTitlesFirstLine[channelIndex].sourceParams[0] + '&page='+ page + '&size=' + this.itemsInPage;
                this.$http.jsonp(url, {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    if (response.data.code == 0) {
                        this.channelTitlesFirstLine[channelIndex].pageNum ++;
                        this.convertDataFromSina(channelIndex, response.data.data.objects);
                    } else if (response.data.code == 2) {
                        this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.nomore;
                    } else {
                        this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.error;
                    }
                    this.setLoadBar(channelIndex);
                }, function(response) {
                    this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.error;
                    this.setLoadBar(channelIndex);
                });
            },

            checkRepeated: function (index, end, data) {
                if (this.channelDataList[index].length > 0) {
                    var k = end;
                    while (k > 0) {
                        k --;
                        if (this.channelDataList[index][k].url == data.url) {
                            return true;
                        }
                    }
                }
                return false;
            },

            convertDataFrom163: function (index, data) {
                var repeated = true;
                var repeatedDataLength = this.channelDataList[index].length;
                for (var i=0; i<data.length; i++) {
                    if (repeated && this.checkRepeated(index, repeatedDataLength, data[i])) {
                        continue;
                    }
                    repeated = false;
                    this.channelTitlesFirstLine[index].loadedItems++;
                    var itemData = {
                        layout: 0,
                        pfrom: data[i].source,
                        ptime: data[i].publishTime,
                        title: data[i].title,
                        summary: data[i].digest.replace(/\s/g, ""),
                        url: data[i].url,
                        image: [],
                        isAd: 0
                    };
                    if (itemData.pfrom == "") {
                        itemData.pfrom = this.channelTitlesFirstLine[index].sourceName;
                    }
                    for (var j=0; j<data[i].images.length && j<this.maxImage; j++) {
                        itemData.image.push(data[i].images[j]);
                    }
                    this.channelDataList[index].push(itemData);
                }
                if (this.channelTitlesFirstLine[index].loadedItems < this.itemsInPage) {
                    this.getChannelDataFrom163(index);
                    return;
                }
                if (this.channelDataList[index].length >= this.maxItemsNum ) {
                    this.channelTitlesFirstLine[index].loadBarStatus = this.loadBarStatus.nomore;
                } else {
                    this.channelTitlesFirstLine[index].loadBarStatus = this.loadBarStatus.loaded;
                }
            },

            getChannelDataFrom163: function(index) {
                var that = this;
                var channelIndex = index;
                var start = this.channelTitlesFirstLine[channelIndex].pageNum * this.itemsInPage; //请求偏移量
                var callbackNum = 0;
                var callbackName = `callback${callbackNum++}`;
                var url = 'http://rss.c.3g.163.com/firefoxbrowser/news/' + start + '-' + this.itemsInPage + '.html?sourceid=' + this.channelTitlesFirstLine[channelIndex].sourceParams[0] + `&callback=${callbackName}`;
                (function (cb) {
                    window[cb] = function (response) {
                        delete window[cb];
                        if (response.code == 200) {
                            that.channelTitlesFirstLine[channelIndex].pageNum ++;
                            that.convertDataFrom163(channelIndex, response.data.list);
                        } else if (response.code == 204) {
                            that.channelTitlesFirstLine[channelIndex].loadBarStatus = that.loadBarStatus.nomore;
                        } else {
                            that.channelTitlesFirstLine[channelIndex].loadBarStatus = that.loadBarStatus.error;
                        }
                        that.setLoadBar(channelIndex);
                    }
                })(callbackName);
                var scriptElem = document.createElement("script");
                scriptElem.src = url;
                scriptElem.onload = function () {
                    this.onload = this.onerror = null;
                    this.parentNode.removeChild(this);
                };
                scriptElem.onerror = function () {
                    this.onload = this.onerror = null;
                    this.parentNode.removeChild(this);
                    that.channelTitlesFirstLine[channelIndex].loadBarStatus = that.loadBarStatus.error;
                    that.setLoadBar(channelIndex);
                };
                document.head.appendChild(scriptElem);
            },

            convertDataFromMiCai: function (index, data) {
                var repeated = true;
                var repeatedDataLength = this.channelDataList[index].length;
                for (var i=0; i < data.length; i++) {
                    if (repeated && this.checkRepeated(index, repeatedDataLength, data[i])) {
                        continue;
                    }
                    repeated = false;
                    this.channelTitlesFirstLine[index].loadedItems++;
                    this.channelDataList[index].push(data[i]);
                }
               if (this.channelTitlesFirstLine[index].loadedItems < this.itemsInPage) {
                    this.getChannelDataFromMiCai(index);
                    return;
                }
                if (this.channelDataList[index].length >= this.maxItemsNum ) {
                    this.channelTitlesFirstLine[index].loadBarStatus = this.loadBarStatus.nomore;
                } else {
                    this.channelTitlesFirstLine[index].loadBarStatus = this.loadBarStatus.loaded;
                }
            },

            getChannelDataFromMiCai: function(index) {
                var channelIndex = index;
                var page = this.channelTitlesFirstLine[channelIndex].pageNum;
                var url = 'http://m.micai.com/cms/api/firefox_api/?from=21642754d22&dt=jsonp&channel_name=军事&index_from=' + page * this.itemsInPage + '&index_to=' + this.itemsInPage;
                this.$http.jsonp(url, {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    if (response.status == 200) {
                        this.channelTitlesFirstLine[channelIndex].pageNum ++;
                        if (response.data.length == 0) {
                            this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.nomore;
                        } else {
                            this.convertDataFromMiCai(channelIndex, response.data);
                        }
                    } else {
                        this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.error;
                    }
                    this.setLoadBar(channelIndex);
                }, function(response) {
                    this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.error;
                    this.setLoadBar(channelIndex);
                });
            },

            getChannelDataFromMiaopai: function(index) {
                var channelIndex = index;
                var page = this.channelTitlesFirstLine[channelIndex].pageNum;
                var start = page * this.itemsInPage + 1;
                var url = 'http://api.yixia.com/m/firefox_recommend.json?start=' + start + '&size=' + this.itemsInPage;
                this.$http.jsonp(url, {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    if (response.status == 200) {
                        this.channelTitlesFirstLine[channelIndex].pageNum ++;
                        if (response.data.length == 0) {
                            this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.nomore;
                        } else {
                            var repeated = true;
                            var repeatedDataLength = this.channelDataList[channelIndex].length;
                            for (var i=0; i < response.data.length; i++) {
                                if (repeated && this.checkRepeated(channelIndex, repeatedDataLength, response.data[i])) {
                                    continue;
                                }
                                repeated = false;
                                this.channelTitlesFirstLine[channelIndex].loadedItems++;
                                this.channelDataList[channelIndex].push(response.data[i]);
                            }
                            if (this.channelTitlesFirstLine[index].loadedItems < this.itemsInPage) {
                                this.getChannelDataFromMiaopai(channelIndex);
                                return;
                            }
                            if (this.channelDataList[channelIndex].length >= this.maxItemsNum ) {
                                this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.nomore;
                            } else {
                                this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.loaded;
                            }
                        }
                    } else {
                        this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.error;
                    }
                    this.setLoadBar(channelIndex);
                }, function(response) {
                    this.channelTitlesFirstLine[channelIndex].loadBarStatus = this.loadBarStatus.error;
                    this.setLoadBar(channelIndex);
                });
            },

            getChannelDataFromMozillaOnline: function() {
                this.$http.get('../mobile.firefoxchina.cn_popnews.json', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    if (response.data.length <= 0) {
                        this.getChannelData(0, false);
                        return;
                    }
                    for (var i=0; i<response.data.length; i++) {
                        this.channelDataList[0].push(response.data[i]);
                    }
                    this.channelTitlesFirstLine[0].loadBarStatus = this.loadBarStatus.loaded;
                    this.setLoadBar(0);
                }, function(response) {
                    this.getChannelData(0, false);
                });
            },

            snap: function(sessionChannelsOffset, sessionRecommendOffset) {
                if (window.scrollY >= sessionChannelsOffset && window.scrollY < sessionRecommendOffset) {
                    this.floatChannelsTitle = 1;
                } else {
                    this.floatChannelsTitle = 0;
                }
            }
        },

        ready: function() {
            this.getTitleData();
            var that = this;
            var timeoutId = null;
            var oldOrientation = window.orientation;
            // alert(screen.width);
            window.addEventListener("orientationchange", function(event) {
                if (Math.abs(oldOrientation) + Math.abs(window.orientation) != 180) {
                    that.resetTitle();
                }
                oldOrientation = window.orientation;
            });
            window.addEventListener("scroll", function() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(that.snap, 10, document.getElementById("ff-channels").offsetTop, document.getElementById("ff-recommend").offsetTop - parseFloat(document.defaultView.getComputedStyle(document.getElementById("nav-wrap"),null).height));
                that.changeLastTitleStatus();
                if (that.curChannelMenuIndex >= 0) {
                    that.channelTitlesFirstLine.splice(-1, 1, that.channelTitlesMenu[that.curChannelMenuIndex]);
                } else {
                    that.channelTitlesFirstLine.splice(-1, 1, {"channelName": "全部"});
                }
            });
        }
    };
</script>

<template>
    <section id="ff-channels" class="ff-channels">
        <div class="nav-wrap" id="nav-wrap" v-show="channelTitlesFirstLine.length > 0" :class="{'hasfixed': floatChannelsTitle==1}">
            <nav class="navdrag addflex" id="navdrag" draggable="true" @touchmove="touchmoveTitle" @touchstart="touchstartTitle">
                <span class="channel-title" v-for="title in channelTitlesFirstLine" :class="{'active': $index==curChannelIndex}" track-by="$index" @click="clickHandler($index,title.channelName)">
                    <span>{{title.channelName}}</span>
                </span>
            </nav>
            <div class="channel-pulldown-button" id="channel-pulldown-button" style="transform: rotate(0deg)" @click="clickPulldownButton()">
                <img src="../../dist/images/channel-pulldown.png">
            </div>
            <nav class="nav-pulldownmenu addflex clearfix" id="nav-pulldownmenu" style="display: none" :class="{'static': floatChannelsTitle==1}">
                <span class="channel-title" v-for="title in channelTitlesMenu" :class="{'active': $index==curChannelMenuIndex}" track-by="$index" @click="clickChannelPulldownMenuHandler($index,title.channelName)">
                    <span>{{title.channelName}}</span>
                </span>
            </nav>
        </div>
        <div id="content-wrap" class="content-wrap" :class="{'hasOffset': floatChannelsTitle==1}">
            <div id="channel-content" @touchend="touchendContent" @touchstart="touchstartContent">
                <div v-for="title in channelTitlesFirstLine" track-by="$index" v-show="$index == curChannelIndex">
                    <div class="content-show-area" v-for="data in channelDataList[$index]">
                        <a @click="gotoUrl(trackType + title.channelName, data.url)" v-if="data.image.length==1">
                            <div class="content-show-item single center" v-if="data.layout==10">
                                <div class="content-show-text">
                                    <h3 class="text-title single">{{data.title}}</h3>
                                    <div class="text-coming">
                                        <span class="ad" v-show="data.isAd == 1">广告</span>
                                        <span class="pfrom">{{data.pfrom}}</span>
                                        <span>{{data.ptime}}</span>
                                    </div>
                                </div>
                                <div class="content-show-img">
                                    <div class="show-img">
                                        <img class="default-image" :src="data.image" @load="successLoadImg" @error="errorLoadImg">
                                    </div>
                                </div>
                                <div class="text-detail" v-show="data.summary.length > 0">{{data.summary}}</div>
                            </div>
                            <div class="content-show-item single" v-else v-bind:class="{'left': data.layout!=11, 'right': data.layout==11}">
                                <div class="content-show-img">
                                    <div class="show-img">
                                        <img class="default-image" :src="data.image" @load="successLoadImg" @error="errorLoadImg">
                                    </div>
                                </div>
                                <div class="content-show-text">
                                    <div class="text-content">
                                        <h3 class="text-title">{{data.title}}</h3>
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
                        <a @click="gotoUrl(trackType + title.channelName, data.url)" v-else>
                            <div class="content-show-item" v-bind:class="{'noimage': data.image.length<1, 'multiple': data.image.length>1}">
                                <div class="content-show-text">
                                    <h3 class="text-title">{{data.title}}</h3>
                                    <div class="content-show-img">
                                        <div class="show-img" v-for="img in data.image">
                                            <img class="default-image" :src="img" @load="successLoadImg" @error="errorLoadImg">
                                        </div>
                                    </div>
                                    <div class="text-coming">
                                        <span class="ad" v-show="data.isAd == 1">广告</span>
                                        <span class="pfrom">{{data.pfrom}}</span>
                                        <span>{{data.ptime}}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="ff-channels-loadMore">
                        <div class="clickLoadMore">
                            <span>{{loadText.info}}<em>{{loadText.action}}</em></span>
                        </div>
                        <div class="channelLoading">
                            <span class="icon-loadMore"></span>
                            <span class="text-loadMore">正在加载</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="splitBar"></div>
    </section>
</template>