var x_open = jutil.Class.create();
jutil.extend(x_open.prototype,{
  initialize: function(options) {
	this.index = 0;//当前索引
	this.element = [];//存放元素对象
	this.maxIndex = 99;//当前zIndex最大值

	this.initial_width = this.initial_height = 0;
	this.initial_left = 10;
	this.initial_top = document.body.scrollTop * 1 + 10;
	this._x = this._y = this._w = this._h = 0;
	
	
	this.icon = {
		symbol_img:"symbol.gif",
		max_img: 'max.gif',
        min_img: 'min.gif',
		close_img: 'close.gif',
		help_img: 'help.gif',
        title_img: 'title.gif',
        bottom_img: 'bottom.gif',
        intern_img: 'intern.gif',
		grip_img: 'grip.gif',
		forward_img: 'forward_off.gif',
		back_img: 'back_off.gif',
		border_img: 'border.gif',
		loading_page: 'loading.htm'
	};
	
	this.SetOptions(options);
	
	this.path = this.options.path;
	this.showFoot = !!this.options.showFoot;
	this.showMax = !!this.options.showMax;
	this.winColor = this.options.winColor;
	this.bodyColor = this.options.bodyColor;
	this.fontColor = this.options.fontColor;
	
	for(var n in this.icon){
		this.icon[n] = this.path + this.icon[n];
	}
  },
  //设置默认属性
  SetOptions: function(options) {
	this.options = {//默认值
	    path:      	    'images/', //图标地址
		showFoot:		true,//显示窗底
		showMax:    	false, //最大化显示
		winColor:      '#cccccc',//视窗颜色
		bodyColor:      '#ffffff',//窗体颜色
		fontColor:		'#000000'//字体颜色	
	};
	jutil.extend(this.options, options || {});
  },
  //初始化
  xopen: function(title, url, width, height) {
	var oThis = this;
	var index = this.index;
	this.icon.loading_page = url;
	this.initial_width = width;
	this.initial_height = height;
	this.initial_left += 20;//X坐标偏移
	this.initial_top += 25;//Y坐标偏移
	
	var divWin = document.createElement("div");
	divWin.style.position = "absolute";
	divWin.style.zIndex = ++this.maxIndex;
	divWin.style.width = this.initial_width + "px";
	divWin.style.height = this.initial_height + "px";
	divWin.style.left = this.initial_left + "px";
	divWin.style.top = this.initial_top + "px";
	divWin.style.fontSize = "12px";
	divWin.onselectstart = function(){ return false; };
	
	/* ------------- 第一个DIV结束 -------------------*/
	
	var divBorder = document.createElement("div");
	divBorder.style.position = "absolute";
	divBorder.style.zIndex = this.maxIndex;
	divBorder.style.width = "0px";
	divBorder.style.height = "0px";
	divBorder.style.display = "none";
	
	/* ------------- 第二个DIV结束 -------------------*/
	
	var tableTop = document.createElement("table");
	tableTop.setAttribute("width","100%");
	tableTop.setAttribute("height","18");
	tableTop.setAttribute("cellspacing","0");
	tableTop.setAttribute("cellpadding","0");
	tableTop.setAttribute("border","0");
	
	var tr = tableTop.insertRow();
	
	var tdSymbol = tr.insertCell();
	tdSymbol.setAttribute("width","19");
	tdSymbol.setAttribute("bgcolor",this.winColor);
	tdSymbol.setAttribute("background",this.icon.symbol_img);
	tdSymbol.style.cursor = "pointer";
	tdSymbol.onclick = function(){ oThis.change_index(index); oThis.xopen_reload(index); }
	
	var tdBack = tr.insertCell();
	tdBack.setAttribute("width","19");
	tdBack.setAttribute("bgcolor",this.winColor);
	tdBack.setAttribute("background",this.icon.back_img);
	tdBack.onclick = function(){ oThis.change_index(index); oThis.xopen_back(index); }

	var tdForward = tr.insertCell();
	tdForward.setAttribute("width","19");
	tdForward.setAttribute("bgcolor",this.winColor);
	tdForward.setAttribute("background",this.icon.forward_img);
	tdForward.onclick = function(){ oThis.change_index(index); oThis.xopen_forward(index); }

	var tdTitle = tr.insertCell();
	tdTitle.setAttribute("bgcolor",this.winColor);
	tdTitle.setAttribute("attr","min");
	tdTitle.style.cssText = "cursor:move;-moz-user-select:none";
	tdTitle.ondblclick = function(){ oThis.maximize(this,index); }
	tdTitle.onmousedown = function(event){ oThis.change_index(index); oThis.initialize_drag(event || window.event,index); }
	tdTitle.onselectstart = function(){ return false; }
	tdTitle.innerHTML = "<font color='" + this.fontColor + "'><strong>" + title + "</strong></font>";

	var tdMin = tr.insertCell();
	tdMin.setAttribute("width","19");
	tdMin.setAttribute("bgcolor",this.winColor);
	tdMin.setAttribute("background",this.icon.min_img);
	tdMin.setAttribute("attr","open");
	tdMin.style.cursor = "pointer";
	tdMin.onclick = function(){ oThis.change_index(index); oThis.minimize(this,index); }
	
	var tdClose = tr.insertCell();
	tdClose.setAttribute("width","19");
	tdClose.setAttribute("bgcolor",this.winColor);
	tdClose.setAttribute("background",this.icon.close_img);
	tdClose.style.cursor = "pointer";
	tdClose.onclick = function(){ oThis.closeit(index); }
	
	/* ------------- 第一个Table结束 -------------------*/
	
	var tableFrame = document.createElement("table");
	tableFrame.setAttribute("width","100%");
	tableFrame.setAttribute("height","100%");
	tableFrame.setAttribute("cellspacing","0");
	tableFrame.setAttribute("cellpadding","0");
	tableFrame.setAttribute("border","0");
	
	var divFrame = document.createElement("div");
	divFrame.style.position = "absolute";
	divFrame.style.zIndex = "1";
	divFrame.style.width = "100%";
	divFrame.style.height = "100%";
	divFrame.style.left = "0px";
	divFrame.style.top = "0px";
	divFrame.style.display = "none";
	
	var iframe = document.createElement("iframe");
	iframe.src = this.icon.loading_page;
	iframe.setAttribute("frameborder","0 noresize");
	iframe.style.position = "absolute";
	iframe.style.zIndex = "0";
	iframe.style.left = "0px";
	iframe.style.top = "0px";
	iframe.style.width = "100%";
	iframe.style.height = "100%";
	iframe.style.margin = "0px";
	iframe.style.padding = "0px";
	iframe.style.border = "0px";
	
	var tr = tableFrame.insertRow();
	
	var tdLeft = tr.insertCell();
	tdLeft.setAttribute("width","1");
	tdLeft.setAttribute("bgcolor",this.winColor);
	
	var tdCenter = tr.insertCell();	
	tdCenter.style.position = "relative";
	tdCenter.setAttribute("bgcolor",this.bodyColor);
	tdCenter.appendChild(divFrame);
	tdCenter.appendChild(iframe);
	
	var tdRight = tr.insertCell();
	tdRight.setAttribute("width","1");
	tdRight.setAttribute("bgcolor",this.winColor);
	
	/* ------------- 第二个Table结束 -------------------*/
	
	var tableBottom = document.createElement("table");
	tableBottom.setAttribute("width","100%");
	tableBottom.setAttribute("height","13");
	tableBottom.setAttribute("cellspacing","0");
	tableBottom.setAttribute("cellpadding","0");
	tableBottom.setAttribute("border","0");
	if(!this.showFoot){ tableBottom.style.visibility = "hidden"; }
	
	var tr = tableBottom.insertRow();
	var tdLeft = tr.insertCell();
	tdLeft.setAttribute("bgcolor",this.winColor);
	tdLeft.style.cursor = "move";
	tdLeft.onmousedown = function(event){ oThis.change_index(index); oThis.initialize_drag(event || window.event,index); }
	
	var tdRight = tr.insertCell();
	tdRight.setAttribute("bgcolor",this.winColor);
	tdRight.setAttribute("width","19");
	tdRight.setAttribute("background",this.icon.grip_img);
	tdRight.style.cursor = "nw-resize";
	tdRight.onmousedown = function(event){ oThis.change_index(index); oThis.initialize_resize(event || window.event,index); }
	
	/* ------------- 第三个Table结束 -------------------*/
	
	divWin.appendChild(tableTop);
	divWin.appendChild(tableFrame);
	divWin.appendChild(tableBottom);

	document.body.appendChild(divWin);
	document.body.appendChild(divBorder);
	
	this.element.push({ x_open_win:divWin,x_open_win_frame:divFrame,x_open_frame:iframe,x_open_win_border:divBorder });
	
	if(this.showMax){
		this.maximize(tdTitle,index);
	}
	this.index++;
  },
  xopen_back:function(i){
	this.element[i].x_open_frame.contentWindow.history.back();
  },
  xopen_forward:function(i){
	this.element[i].x_open_frame.contentWindow.history.go(1);
  },
  xopen_reload:function(i){
	this.element[i].x_open_frame.contentWindow.location.reload();
  },
  closeit:function(i){
	document.body.removeChild(this.element[i].x_open_win);
	document.body.removeChild(this.element[i].x_open_win_border);
	delete this.element[i]; //移除数组且保留索引
  },
  minimize:function(o,i){
	if (o.getAttribute("attr") == "open"){
		o.setAttribute("attr","close");
		o.setAttribute("background",this.icon.max_img);
		this.element[i].x_open_win.children[1].style.display = this.element[i].x_open_win.children[2].style.display = "none";
	}
	else{
		o.setAttribute("attr","open");	
		o.setAttribute("background",this.icon.min_img);
		this.element[i].x_open_win.children[1].style.display = this.element[i].x_open_win.children[2].style.display = "";
	}
  },
  maximize:function(o,i){
	var oThis = this;
	if (o.getAttribute("attr") == "min"){
		o.setAttribute("attr","max");
		
		o.style.cursor = "default";
		o.onmousedown = null;
		document.body.style.overflow = 'hidden';	//去掉浏览器滚动条
		
		this.initial_width = parseInt(this.element[i].x_open_win.style.width);
		this.initial_height = parseInt(this.element[i].x_open_win.style.height);
		this.initial_left = parseInt(this.element[i].x_open_win.style.left);
		this.initial_top = parseInt(this.element[i].x_open_win.style.top);
		
		this.change_size(window.innerWidth,window.innerHeight,i);
		
		this.element[i].x_open_win.style.left = "0px";
		this.element[i].x_open_win.style.top = "0px";
	}
	else{
		o.setAttribute("attr","min");
		
		this.change_size(this.initial_width,this.initial_height,i);
		
		this.element[i].x_open_win.style.left = this.initial_left + "px";
		this.element[i].x_open_win.style.top = this.initial_top + "px";
		
		o.style.cursor = "move";
		o.onmousedown = function(event){ oThis.change_index(i); oThis.initialize_drag(event,i); }
		
		document.body.style.overflow = 'scroll'; //显示浏览器滚动条
	}
  },
  change_size:function(w,h,i){ 
		if(w > 150 ) {
			this.element[i].x_open_win.style.width = w + "px";
		}else{
			this.element[i].x_open_win.style.width = "150px";
		}
		if(h > 0 ) {
			this.element[i].x_open_win.style.height = h + "px";
		}else{
			this.element[i].x_open_win.style.height = "0px";
			
		}
  },
  change_index:function(i){ 
  		var tmp = [];
		jutil.each(this.element,function(o){
			if(o != undefined){ tmp.push(parseInt(o.x_open_win.style.zIndex)); }//把zIndex压入数组
		});
		this.maxIndex = Math.max.apply(null,tmp);//获取数组最大值

		if(this.maxIndex > parseInt(this.element[i].x_open_win.style.zIndex)){
			this.element[i].x_open_win.style.zIndex = this.element[i].x_open_win_border.style.zIndex = ++this.maxIndex;
		}
  },
  initialize_drag:function(e,i){
	var oThis = this;

	this._x = e.clientX - this.element[i].x_open_win.offsetLeft;
	this._y = e.clientY - this.element[i].x_open_win.offsetTop;
	
	jutil.each(this.element,function(list){
		if(list != undefined){ list.x_open_win_frame.style.display = "block"; }
	});
	
	document.onmousemove = function(e){ oThis.drag_drop(e,i); };	
	document.onmouseup = function(e){ oThis.drag_drop_stop(e,i); };
  },
  drag_drop:function(e,i){
	this.element[i].x_open_win.style.left = e.clientX - this._x + "px";
	this.element[i].x_open_win.style.top = e.clientY - this._y + "px";
  },
  drag_drop_stop:function(e,i){
	jutil.each(this.element,function(list){
		if(list != undefined){ list.x_open_win_frame.style.display = "none"; }
	});
	document.onmousemove=null;
  },
  initialize_resize:function(e,i){
	var oThis = this;
	
	this.element[i].x_open_win_border.style.left = this.element[i].x_open_win.style.left;
	this.element[i].x_open_win_border.style.top = this.element[i].x_open_win.style.top;
	this.element[i].x_open_win_border.style.width = this.element[i].x_open_win.style.width;
	this.element[i].x_open_win_border.style.height = this.element[i].x_open_win.style.height;

	this._x = e.clientX;
	this._y = e.clientY;
	this._w = this._x - parseInt(this.element[i].x_open_win.offsetLeft);
	this._h = this._y - parseInt(this.element[i].x_open_win.offsetTop);

	this.element[i].x_open_win_border.style.display = '';
	this.element[i].x_open_win_border.style.border='1px #808080 solid';
	
	jutil.each(this.element,function(list){
		if(list != undefined){ list.x_open_win_frame.style.display = "block"; }
	});
	
	document.body.style.cursor = 'nw-resize';
	document.onmousemove = function(e){ oThis.drag_resize(e,i); }
	document.onmouseup = function(e){ oThis.drag_resize_stop(e,i); }
  },
  drag_resize:function(e,i){
	this.element[i].x_open_win_border.style.width = this._w + (e.clientX - this._x) + "px";
	this.element[i].x_open_win_border.style.height = this._h + (e.clientY - this._y) + "px";
	document.body.style.cursor = 'nw-resize';
  },
  drag_resize_stop:function(e,i){
	this.change_size(parseInt(this.element[i].x_open_win_border.style.width), parseInt(this.element[i].x_open_win_border.style.height),i);
	this.element[i].x_open_win_border.style.border='0px';
	this.element[i].x_open_win_border.style.display = 'none';
	jutil.each(this.element,function(list){
		if(list != undefined){ list.x_open_win_frame.style.display = "none"; }
	});
	document.body.style.cursor='default';
	document.onmousemove=null;
  }
});