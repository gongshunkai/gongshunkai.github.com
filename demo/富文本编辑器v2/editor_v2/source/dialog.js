/*************** 对话框类 ********************/

//全局自定义事件
var Event = {

	//事件集合
	clients:[],

	//绑定事件
	on:function(key,fn){
		if(!this.clients[key])
			this.clients[key] = [];

		//订阅的消息加进缓存列表
		this.clients[key].push(fn);

		return this;
	},

	//触发事件
	fire:function(){
		var key = [].shift.call(arguments),
			fns = this.clients[key];
		
		//如果没有绑定对应的消息
		if(!fns || fns.length === 0) return this;
		
		for(var i =0, fn; fn=fns[i++];)
			fn.apply(this,arguments);

		return this;
	},

	//移除事件
	off:function(key,fn){
		var fns = this.clients[key];
	
		//如果key对应的消息没有被人订阅，则直接返回
		if(!fns) return this;

		//如果没有传入具体的回调函数，表示需要取消key对应的所有订阅
		if(!fn){
			fns && (fns.length = 0);
		}else{
			for(var i=fns.length - 1; i>=0;i--){
				var _fn = fns[i];
				if(_fn === fn){
					//删除订阅者的回调函数
					fns.splice(i,1);
				}
			}
		}
		return this;
	}
};

Event.on('display.dialog',function(){
	this.target.attr('tabIndex','-1');
});

//动画速度
Event.on('display.dialog',function(){
	this.opts.speed = this.opts.show ? 0 : 'slow';
});

//自定义对话框大小
Event.on('display.dialog',function(){
	this.size(this.opts.width,this.opts.height);
});

//自定义对话框位置
Event.on('display.dialog',function(){
	this.opts.absolute && this.position(this.opts.left,this.opts.top);
});

//绝对定位
Event.on('display.dialog',function(){
	this.opts.absolute && this.target.css('position','absolute');
});

//加入ESC键盘事件
Event.on('display.dialog',function(){
	this.opts.keyEsc && this._addEscBehaviour();
});

//添加皮肤样式名
Event.on('display.dialog',function(){
	this.opts.skinClassName && this.target.addClass(this.opts.skinClassName);
});

//隐藏模态框头部
Event.on('display.dialog',function(){
	this.opts.hideToolbar && this._hideHeader();
});

//隐藏模态框主体
Event.on('display.dialog',function(){
	this.opts.hideContent && this._hideBody();
});

//模态框显示前
Event.on('show.dialog',function(){
	this.opts.onShow && this.opts.onShow();
});

//模态框显示后
Event.on('shown.dialog',function(){
	this.opts.onShown && this.opts.onShown();
});

//模态框隐藏前
Event.on('hide.dialog',function(){
	this.opts.onHide && this.opts.onHide();
});

//模态框隐藏后
Event.on('hiden.dialog',function(){
	this.opts.onHiden && this.opts.onHiden();
});


var Dialog = (function(){

	var dialogCache = [],
		dialog;

	return function(opts){

		opts = opts || {};

		dialog = dialogCache[opts.id];

		return dialog || (dialog = new DialogBox(opts)), opts.id && (dialogCache[opts.id] = dialog), dialog;
	};

})();


var DialogBox = function(){
	this.init.apply(this,arguments);
};

$.extend(DialogBox.prototype,Event,{

	//初始化
	init:function(options){

		//设置参数
		this.opts = $.extend({}, DialogBox.defaults, options);

		//自定义事件集合:继承自全局自定义事件集合
		this.clients = $.extend(true,{},Event.clients);

		//按钮集合
		this.buttons = [];
	},

	//显示对话框
	show:function(options){

		var opts = $.extend({}, options);

		if(this.opts.draw){
			this.opts.reload &&	this._loadContents(opts.contents);

			setTimeout(function(){

				this.fire('show.dialog');

				this.target.fadeIn(this.opts.speed,function(){
					this.fire('shown.dialog');
				}.bind(this));
			}.bind(this),100);
				
		}else{
			this._show(opts);
		}

	},

	_show:function(opts){

		//防止重复创建
		this.opts.draw = true;

		//设置id
		this.opts.id = this.opts.id || DialogBox.getTimeTick();

		//渲染对话框
		var appendWindow = this._drawWindow(opts);

		//安装按钮
		this._injectAllButtons();

		//设置对话框位置
		this.position();

		//触发自定义事件
		this.fire('display.dialog');

		//把窗体添加到文档
		appendWindow();
	},

	//隐藏对话框
	hide:function(){
		if(this.target.is(':visible')){

			this.fire('hide.dialog');

			this.target.fadeOut(this.opts.speed,function(){
				this.fire('hiden.dialog');

				this.opts.closeType == 'close' && this._hide();
			}.bind(this));
		}
	},

	_hide:function(){
		this.fire('hide.dialog');
		this.destory();
	},

	//销毁对话框
	destory:function(){

		this.fire('destory.dialog');

		this.target.remove();

		this.buttons = 
			this.clients = [];
	},

	//获取/设置对话框位置
	position: function(x,y){

		if(x == undefined){
			x = this.target.position().left;
		}else{
			this.opts.left = x;
			this.target.css('left',this.opts.left);
		}

		if(y == undefined){
			y = this.target.position().top;
		}else{
			this.opts.top = y;
			this.target.css('top',this.opts.top);
		}

		return { x:x, y:y };
	},

	//获取/设置对话框大小
	size: function(w,h){

		if(w == undefined){
			w = this.target.width();
		}else{
			this.opts.width = w;
			this.target.outerWidth(this.opts.width);
		}

		if(h == undefined){
			h = this.target.height();
		}else{
			this.opts.height = h;
			if(this.opts.fullHeight)
				this.target.outerHeight(this.opts.height);
			else
				this.target.find('.editor-content').outerHeight(this.opts.height);
		}

		return { w:w, h:h };
	},
	
	//加入按钮
	addButton:function(button){
		this.buttons.push(button);
		return this;
	},

	//渲染对话框
	_drawWindow:function(opts){

		var self = this;

		//设置内容
		var html = this._template(this.opts.template, {
			'_CONTENTS_':opts.contents ? opts.contents.toString() : ''
		});

	   	this.target = $(html);

		this._loadContents(opts.contents);

		if(this.opts.clickBoxClose){
			$(this.opts.clickBoxClose)
			.on('click',this.hide.bind(this))
			.on('keyup',function(e){
			if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 13)
				this.hide();
			}.bind(this));
		}

    	//延迟执行
		return function(){
			//加入模态窗
			$(self.opts.appendTo)[self.opts.appendMode](self.target);

			self.fire('show.dialog');

			self.target.fadeIn(self.opts.speed,function(){
				self.fire('shown.dialog');
			});
		};
  
	},

	_loadContents:function(contents){
		//内容是JQ对象
		if(contents && contents.jquery){
			this.target.find('.editor-content').empty().append(contents);
		}
		//内容是回调函数
		else if(typeof contents === 'function'){
			contents(this.target.find('.editor-content').empty());
		}
	},

	//隐藏模态框头部
	_hideHeader:function(){
		this.target.find('.toolbar').hide();
	},

	//隐藏模态框主体
	_hideBody:function(){
		this.target.find('.editor-content').hide();
	},

	//安装按钮
	_injectAllButtons: function(){
		
		this.buttons.forEach(function(el){
			this.target.find('.toolbar ul.list-inline').append(el);
		},this);
    },

    //加入ESC键盘事件
	_addEscBehaviour: function(){
		if(this.opts.keyEsc){
			this.removeFn = function(e){
				if(e.keyCode == 27) this.hide();
			}.bind(this);
			this.target.on('keydown',this.removeFn);
		}
	},

	//模板
	_template:function(s,d){
		for(var p in d)
			s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
		return s;
	}
});

DialogBox.getTimeTick = function(){
	return new Date().getTime();
};

DialogBox.defaults = {
	width:     600, //对话框宽度
	height:    400, //对话框高度
	fullHeight:true,//true:高度等于模态框 false:高度等于模态框主体
	appendTo:  document.body, //把模态窗口放在指定的dom元素中
	appendMode:'append', //append,prepend,after,before
	clickBoxClose:null,
	closeType: 'close', //关闭方式 'close','hide'
	reload: false, //是否重新加载内容
	absolute:  true, // 是否绝对定位
	left:     0, //自定义位置 left
	top:      0, //自定义位置 top
    hideToolbar:    false, //隐藏对话框头部
    hideContent:    false, //隐藏对话框主体
    skinClassName: null, //皮肤样式名
    keyEsc:    true,//键盘上的 esc 键被按下时关闭模态框
    show:          false, //模态框初始化之后就立即显示出来
    onShow:    null, //模态框显示前立即触发该事件
    onShown:     null, //模态框已经显示出来（并且同时在动画效果完成）之后被触发
    onHide:    null, //模态框隐藏前立即触发该事件
    onHidden:     null, //此事件在模态框被隐藏（并且同时在动画效果完成）之后被触发
    template:'<div class="editor-wrap">\
    	<div class="toolbar">\
    		<ul class="list-inline" unselectable="on" onselectstart="return false"></ul>\
    	</div>\
        <div class="editor-content">{_CONTENTS_}</div>\
    </div>'
};