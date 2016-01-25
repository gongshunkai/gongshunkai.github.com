var GetPageSize = function() {
	var scrW, scrH;
	if(window.innerHeight && window.scrollMaxY) {
		// Mozilla
		scrW = window.innerWidth + window.scrollMaxX;
		scrH = window.innerHeight + window.scrollMaxY;
	}else if(document.body.scrollHeight > document.body.offsetHeight){
		// all but IE Mac
		scrW = document.body.scrollWidth;
		scrH = document.body.scrollHeight;
	}else if(document.body) { // IE Mac
		scrW = document.body.offsetWidth;
		scrH = document.body.offsetHeight;
	}

	var winW, winH;
	if(window.innerHeight) { // all except IE
		winW = window.innerWidth;
		winH = window.innerHeight;
	}else if (document.documentElement && document.documentElement.clientHeight) {
		// IE 6 Strict Mode
		winW = document.documentElement.clientWidth; 
		winH = document.documentElement.clientHeight;
	}else if (document.body) { // other
		winW = document.body.clientWidth;
		winH = document.body.clientHeight;
	}

	// for small pages with total size less then the viewport
	var pageW = (scrW<winW) ? winW : scrW;
	var pageH = (scrH<winH) ? winH : scrH;

	return{PageW:pageW, PageH:pageH, WinW:winW, WinH:winH};
};