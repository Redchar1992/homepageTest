var Vue = require('vue');
var VueResource = require('vue-resource');

var ffHeader = require('./component/ffHeader');
var ffSites = require('./component/ffSites');
var ffChannels = require('./component/ffChannels');
var ffRecommend = require('./component/ffRecommend');
var ffFooter = require('./component/ffFooter');
var ffCorner = require('./component/ffCorner');

Vue.use(VueResource);
require('./base.scss');
Vue.config.debug = false;
Vue.config.devtools = false;
Vue.prototype.gotoUrl = function(type, url) {
    var trackUrl = "null";
    if (url != null) {
        trackUrl = url;
    }
    this.$http.get('../v2/json/data.json?type=' + type + '&url=' + encodeURIComponent(trackUrl) + '&t=' + Math.random(), {}, {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        emulateJSON: true
    }).then(function(response) {
        if (url != null && url.length > 0) {
            window.location.href = url;
        }
    }, function(response) {
        if (url != null && url.length > 0) {
            window.location.href = url;
        }
    });
};
Vue.prototype.successLoadImg = function(event) {
    if (event.target.complete == true) {
        event.target.classList.remove("default-image");
        var imgParentNode = event.target.parentNode;
        if (imgParentNode.classList.contains('show-img') == true) {
            imgParentNode.style.background = "black";
        }
    }
};
Vue.prototype.errorLoadImg = function(event) {
    event.target.classList.add("default-image");
};
Vue.prototype.isIOS = (window.location.href.indexOf("?ios") > 0);
var ffHeaderVue = new Vue(ffHeader);
var ffSitesVue = new Vue(ffSites);
var ffChannelsVue = new Vue(ffChannels);
var ffRecommendVue = new Vue(ffRecommend);
var ffFooterVue = new Vue(ffFooter);
var ffCornerVue = new Vue(ffCorner);