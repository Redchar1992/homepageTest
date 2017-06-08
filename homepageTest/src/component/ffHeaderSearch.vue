<script type="text/javascript">
    export default {
        el: '#ff-header-search',

        data() {
            return {
                trackType: "search",
                ff_hotwords: [],
                highlightindex: -1     // key word select num
            }
        },

        methods: {
            gotoSearch: function() {
                if (document.getElementById("searchData").value.length <=0) {
                    return;
                }
                document.getElementById('pagesZone').style.display = "none";
                var url = "https://m.baidu.com/s?from=1000969a&word=" + document.getElementById("searchData").value;
                // console.log(url);
                this.gotoUrl(this.trackType, url);
            },

            startHotWordsAnimation: function() {
                if (this.ff_hotwords.length < 1) {
                    return;
                }
                var line = 0;
                var timer = setInterval(function() {
                    var hotwordsArea = document.getElementById("hotwords-area");
                    var maxH = parseFloat(document.defaultView.getComputedStyle(hotwordsArea,null).height);
                    var memH = parseFloat(document.defaultView.getComputedStyle(hotwordsArea.children[0],null).height);
                    var alen = hotwordsArea.children.length;
                    if (line == 0) {
                        hotwordsArea.classList.add("hotwords-animation");
                    }
                    line ++;
                    var delta = -memH * line;
                    if (Math.abs(delta) + memH >= maxH) {
                        line = 0;
                        delta = 0;
                        hotwordsArea.classList.remove("hotwords-animation");
                    }
                    hotwordsArea.style.transform = hotwordsArea.style.webkitTransform = "translate(0," + delta + "px)";
                },5000);
            },

            getBaidulaWords: function() {
                this.$http.jsonp('http://api.m.baidu.com/?type=hot&from=1000969a&dt=jsonp', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                }, function(response) {
                    this.startHotWordsAnimation();
                });
            },

            getMozillaWords: function() {
                this.$http.get('../v2/json/hotwords.json', {}, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    emulateJSON: true
                }).then(function(response) {
                    var data = response.data["hot"], prop;
                    for (prop in data) {
                        if (data.hasOwnProperty(prop)) {
                            this.ff_hotwords.push(data[prop]);
                        }
                    }
                    this.getBaidulaWords();
                }, function(response) {
                    this.getBaidulaWords();
                });
            },

            fillUrls: function() {
                var that = this;
                var strdomin = document.getElementById("searchData").value;
                window.status = "请求中";
                this.$http.jsonp("http://suggestion.baidu.com/su", {    //请求参数
                    params: {
                      wd: strdomin
                    },
                    jsonp: 'cb'
                }).then(function(res){
                    window.status = "请求结束";
                    that.autoDisplay(JSON.parse(res.body).s);
                },function(){
                    console.log("error");
                });
            },

            autoDisplay: function(autoStr) {
                var searchText = document.getElementById('searchData');
                var autoNode = document.getElementById('auto');  //缓存对象（弹出框）
                var that = this;
                var docWidth = document.body.clientWidth || document.documentElement.clientWidth;
                var pagesZone = document.getElementById('pagesZone');
                if (autoStr.length == 0) {
                    // console.log("false");
                    autoNode.style.display = "none";
                    return false;
                }
                autoNode.innerHTML = "";
                for (var i = 0; i < autoStr.length; i++) {
                    //创建节点
                    var wordNode = autoStr[i].replace(searchText.value,"<b>"+searchText.value+"</b>");
                    var newDivNode = document.createElement('div');
                    newDivNode.setAttribute("id",i);
                    autoNode.appendChild(newDivNode);
                    var wordSpanNode = document.createElement('span');
                    wordSpanNode.setAttribute('class','suggText');
                    wordSpanNode.innerHTML = wordNode;
                    newDivNode.appendChild(wordSpanNode);
                    var addNode = document.createElement('span');
                    addNode.setAttribute('class','addText');
                    addNode.innerHTML = '+';
                    newDivNode.appendChild(addNode);
                    //鼠标点击文字上屏并搜索
                    wordSpanNode.onclick = function () {
                        this.highlightindex = this.parentNode.getAttribute('id');
                        var comText = autoNode.childNodes[this.highlightindex].firstChild.innerText;
                        autoNode.style.display = "none";
                        this.highlightindex = -1;
                        searchText.value = comText;
                        pagesZone.style.display = "none";
                        that.gotoSearch();
                    };
                    //鼠标点击文字上屏
                    addNode.onclick = function () {
                        this.highlightindex = this.parentNode.getAttribute('id');
                        var comText = autoNode.childNodes[this.highlightindex].firstChild.innerText;
                        autoNode.style.display = "none";
                        this.highlightindex = -1;
                        searchText.value = comText;
                    };
                    //展示
                    if (autoStr.length > 0) {
                        autoNode.style.display = "block";
                    } else {
                        autoNode.style.display = "none";
                        this.highlightindex = -1;
                    }
                    //针对手机竖屏时的显示条数控制
                    if (i > 2) {
                        break;
                    }
                }
            },

            close: function() {
                document.getElementById('pagesZone').style.display = 'none';
            },

            listenWords: function(event) {
                // console.log("listen keyup");
                var that = this;
                var searchInput = document.getElementById("searchData");
                event = window.event || event;
                if (event.keyCode == 13) {     // enter
                    // console.log("enter");
                    event.preventDefault();
                    that.gotoSearch();
                }
                if (event.keyCode == 8) {     // backspace
                    // console.log(searchInput.value.length);
                    if(searchInput.value.length == 0){
                        searchInput.blur();
                        searchInput.focus();
                    }
                }
            },

            listenInput: function() {
                var that = this;
                var searchInput = document.getElementById("searchData");
                var auto = document.getElementById('auto');
                var pagesZone = document.getElementById('pagesZone');
                var del = document.getElementsByClassName('del')[0];
                if (searchInput.value == null || searchInput.value == "") {
                    auto.innerHTML = "";
                    pagesZone.style.display = "none";
                    del.style.display = "none";
                    auto.style.display = "none";
                    return;
                }
                pagesZone.style.display = "block";
                del.style.display = "block";
                that.fillUrls();
                if (this.highlightindex != -1) {
                    this.highlightindex = -1;
                }
            },

            gotoGoogle: function() {
                if (document.getElementById("searchData").value.length <=0) {
                    return;
                }
                document.getElementById('pagesZone').style.display = "none";
                var url = "https://www.google.com/search?from=1000969a&q=" + document.getElementById("searchData").value;
                this.gotoUrl(this.trackType, url);
            },

            gotoBing: function() {
                if (document.getElementById("searchData").value.length <=0) {
                    return;
                }
                document.getElementById('pagesZone').style.display = "none";
                var url = "https://cn.bing.com/search?from=1000969a&q=" + document.getElementById("searchData").value;
                this.gotoUrl(this.trackType, url);
            },

            gotoZhiHu: function() {
                if (document.getElementById("searchData").value.length <=0) {
                    return;
                }
                document.getElementById('pagesZone').style.display = "none";
                var url = "https://m.zhihu.com/search?from=1000969a&q=" + document.getElementById("searchData").value;
                this.gotoUrl(this.trackType, url);
            },

            gotoSogou: function() {
                if (document.getElementById("searchData").value.length <=0) {
                    return;
                }
                document.getElementById('pagesZone').style.display = "none";
                var url = "http://wap.sogou.com/web/searchList.jsp?from=1000969a&keyword=" + document.getElementById("searchData").value;
                this.gotoUrl(this.trackType, url);
            },

            gotoJD: function() {
                if (document.getElementById("searchData").value.length <=0) {
                    return;
                }
                document.getElementById('pagesZone').style.display = "none";
                var url = "http://so.m.jd.com/ware/search.action?from=1000969a&keyword=" + document.getElementById("searchData").value;
                this.gotoUrl(this.trackType, url);
            }
        },

        ready() {
            var that = this;
            var searchInput = document.getElementById("searchData");
            var pagesZone = document.getElementById('pagesZone');
            //点击页面隐藏自动补全提示框
            document.onclick = function (e) {
                var e = e ? e : window.event;
                var tar = e.srcElement || e.target;
                if (tar.id != "searchData") {
                    pagesZone.style.display = "none";
                }
            }
            //删除已输入
            var del = document.getElementsByClassName('del')[0];
            del.onclick = function(){
                searchInput.value = "";
                pagesZone.style.display = "none";
                del.style.display = "none";
            }
            window.baidu = {
                'hot': function(response) {
                    var data = response["hot"], prop;
                    for (prop in data) {
                        if (data.hasOwnProperty(prop)) {
                            that.ff_hotwords.push(data[prop]);
                        }
                    }
                    that.startHotWordsAnimation();
                }
            };
            var u = navigator.userAgent;
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            if(isiOS){
                var insert = document.createElement('input');
                insert.style.display = "none";
                document.getElementById('form').appendChild(insert);
            }
            this.getMozillaWords();
        }
    };
</script>

<template>
    <div class="ff-header-search" id="ff-header-search">
        <div class="header-search">
            <form id="form" action="http://m.baidu.com/s?from=1000969a" method="get" accept-charset="utf-8" class="clearfix" autocomplete="off">
                <a>
                    <span class="search-media"></span>
                </a>
                <input id="searchData" type="text" placeholder="搜索一下" name="word" @keyup="listenWords" @input="listenInput" @focus="listenInput" />
                <span class="del">×</span>
                <a @click="gotoSearch">
                    <span class="icon-search icon-sign"></span>
                </a>
            </form>
        </div>
        <!-- 关键词关联 -->
        <div id="pagesZone" class="clearfix">
            <div id="auto"></div>
            <span class="engi">快速搜索：</span>
            <img src="../../dist/images/google.png" alt="谷歌" id="googlePages" @click="gotoGoogle" >
            <img src="../../dist/images/bing.png" alt="必应" id="bing" @click="gotoBing" >
            <img src="../../dist/images/zhihu.png" alt="知乎" id="zhihu" @click="gotoZhiHu" >
            <img src="../../dist/images/sogou.png" alt="搜狗" id="sogo" @click="gotoSogou" >
            <img src="../../dist/images/jd.png" alt="京东" id="jd" @click="gotoJD" >
            <a @click="close" class="close">关闭</a>
        </div>
        <div class="header-hotwords">
            <span class="icon-radio"></span>
            <div id="hotwords-wrap" class="words-wrap">
                <div id="hotwords-area" class="hotwords-area">
                    <a :href="hotword.url"  v-for="hotword in ff_hotwords">
                        <span>{{hotword.word}}</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>