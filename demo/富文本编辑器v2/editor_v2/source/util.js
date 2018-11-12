/*********************** 工具类 ******************************/

var hasBro = (function() {

    var ua = null,
        cm = null,
        bros = {
            ie: false,
            ff: false,
            opera: false,
            safari: false,
            chrome: false,
            unknown: false
        };

    try {
        cm = document.compatMode;
    } catch(A) {}
    try {
        ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("msie") != -1 || ua.indexOf("rv:11") != -1) { bros.ie = true; }
        else if (ua.indexOf("firefox") != -1) { bros.ff = true; }
        else if (ua.indexOf("opera") != -1) { bros.opera = true; }
        else if (ua.indexOf("chrome") != -1) { bros.chrome = true; }
        else if (ua.indexOf("safari") != -1) { bros.safari = true; }
        else { bros.unknown = true; }
    } catch(A) {
        bros.unknown = true;
    }

    return{
        isIE:function(){ return bros.ie; },
        isFF:function(){ return bros.ff; },
        isOpera:function(){ return bros.opera; },
        isChrome:function(){ return bros.chrome; },
        isSafari:function(){ return bros.safari; }
    };

})();

var getTimeTick = function(){
    return new Date().getTime();
};


String.prototype.camelCase = String.prototype.camelCase || function(){
    return this.replace(/-([a-z])/ig,function(all,letter) {
        return letter.toUpperCase();
    });
};

String.prototype.underlineName = String.prototype.underlineName || function(){
    return this.replace(/([A-Z])/g,"-$1").toLowerCase();
};