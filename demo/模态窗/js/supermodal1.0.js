/*!
 * supermodal.js 1.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2017-1-5
 *
 */

function SuperModal(){
    this.init.apply(this,arguments);
};

SuperModal.prototype = {

	//初始化
	init:function(options){

		//设置参数
		this.opts = $.extend({}, SuperModal.defaults, options);

		//自定义事件集合
		this.clients = [];

		//按钮集合
		this.buttons = [];
	},

	//显示模态框
	show:function(options){
		var opts = $.extend({}, options);

		//防止重复创建
		opts.draw = opts.draw == undefined ? true : opts.draw;

		//加入遮罩层
		opts.draw && this.opts.backdrop && this._overlay('show');

		//加入ESC键盘事件
		opts.draw && this._addEscBehaviour();

		//自动关闭模态框
		opts.draw && this.opts.autoClose && this.on('shown',function(){
			setTimeout($.proxy(this.hide,this),this.opts.timeout);
		});

		//渲染模态框
		this._drawWindow(opts);

		//切换不同的模式
		switch(opts.model){

			//提示框
	    	case 'modal-alert' :

	    		//加入确认按钮
				this.addButton(this.opts.btn_ok,'btn btn-primary',$.proxy(function(){
					this.hide();
				},this));
			break;

			//确认框
			case 'modal-confirm' :

				//加入取消按钮
				this.addButton(this.opts.btn_cancel,'btn btn-default',$.proxy(function(){
					this.hide();
				},this));

				//加入确认按钮
				this.addButton(this.opts.btn_ok,'btn btn-primary',opts.callback);
			break;

			//消息框
			case 'modal-message' :

				//隐藏模态框头部
	    		this.opts.hideHeader = true;

	    		//加入确认按钮
	    		this.addButton(this.opts.btn_ok,'btn btn-primary',$.proxy(function(){
					this.hide();
				},this));
			break;

			//ajax
			case 'modal-ajax' :
	    		this._loadContents({
					'url':opts.param.url,
					'onRequestReady':opts.param.onRequestReady,
					'onRequestComplete':opts.param.onRequestComplete,
					'onError':opts.param.onError
				});
			break;

			//lightbox
			case 'modal-lightbox' :

				//设置lightbox参数
				this.lightbox = {
					'element':opts.lightbox.element,
					'group':opts.lightbox.group,
					'order':opts.lightbox.order
				};
	    		this._loadContents({
					'url':opts.param.url,
					'order':this.lightbox.order,
					'onRequestReady':opts.param.onRequestReady,
					'onRequestComplete':opts.param.onRequestComplete
				});
			break;
	    }

	    //自定义模态框宽度
	    this.modal.find('.modal-dialog').width(this.opts.width);

	    //添加皮肤样式名
	    this.opts.skinClassName && this.modal.addClass(this.opts.skinClassName);

	    //隐藏模态框头部
	    this.opts.hideHeader && this.modal.find('.modal-header').hide();

	    //隐藏模态框底部
		this.opts.hideFooter && this.modal.find('.modal-footer').hide();

		//加入关闭按钮
		this.opts.closeButton && this._addCloseButton('<span>&times;</span>','close');

		//安装按钮
		this._injectAllButtons();

		//设置模态框位置
		this._display();
	},

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
		var key = Array.prototype.shift.call(arguments),
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
	},

	//销毁模态框
	hide:function(){
		this.opts.onHide && this.opts.onHide();
		this.fire('hide');

		if(this.opts.show){
			this.modal.remove();
			this.opts.onHidden && this.opts.onHidden();
			this.fire('hidden');
		}else{
			this.modal.fadeOut('slow',$.proxy(function(){
				this.modal.remove();
				this.opts.onHidden && this.opts.onHidden();
				this.fire('hidden');
			},this));
		}
		$(document.body).removeClass('modal-open');

		//移除键盘esc事件
		this._removeEscBehaviour();

		//移除resize事件
		$(window).off('resize',this._resize);

		this.clients.length = 0;
		this.buttons.length = 0;

		this.opts.backdrop && this._overlay('hide');
	},

	//创建元素
	createElement:function(tag,obj){
		if(typeof tag !== 'string') return;

		var node = $('<' + tag + '>'),
			prop, value;

		for(prop in obj){

			value = obj[prop];

			if(prop === 'html')
				value && node.html(value);
			else if(typeof value === 'function')
				value && node.on(prop,value);
			else
				value && node.attr(prop,value);
		}

		return node;
	},

	//加入按钮
	addButton:function(label,classe,clickEvent){
		var btn = this.createElement('button',{
			'type':'button', 'class':classe,
			'html':label, 'click':clickEvent
		});
		this.buttons.push(btn);
		return btn;
	},

	//加入关闭按钮
	_addCloseButton:function(label,classe){
		var btn = this.createElement('button',{
			'type':'button', 'class':classe,
			'html':label, 'click':$.proxy(function(){ this.hide(); },this)
		});
		this.modal.find('.modal-header').prepend(btn);
		return btn;
	},

	//渲染模态框
	_drawWindow:function(opts){

		//设置内容
		var html = this._template(this.opts.template, {
			"_TITLE_":opts.title || "Untitled",
			"_CONTENTS_":opts.contents || ""
		});
	    
	    //防止重复创建
	    if(opts.draw){
	    	this.modal = $(html);
	    	$(document.body).append(this.modal).addClass('modal-open');
	    	this.opts.backdrop && this.modal.on('click',$.proxy(this.hide,this));

	    	//添加resize事件
			this._resize = $.proxy(this._display,this);
			$(window).on('resize',this._resize);

	    }else{
	    	this.modal.html($(html).html());
	    }    

	    //禁止所有子元素冒泡行为
	    this.opts.backdrop && this.modal.find('*').on('click',function(e){
    		e.stopPropagation();
    	});

	    this.opts.onShow && this.opts.onShow();
	    this.fire('show');

	    if(this.opts.show){
	    	this.modal.show();
	    	this.opts.onShown && this.opts.onShown();
	    	this.fire('shown');
	    }else{
	    	this.modal.fadeIn('slow',$.proxy(function(){
	    		this.opts.onShown && this.opts.onShown();
	    		this.fire('shown');
	    	},this));
	    }
	},

	//安装按钮
	_injectAllButtons: function(){
		$.each(this.buttons,$.proxy(function(i,e){
			this.modal.find('.modal-footer').append(e);
		},this));
    },

    //加入ESC键盘事件
	_addEscBehaviour: function(){
		if(this.opts.keyEsc){
			this._removeSM = $.proxy(function(e){
				if(e.keyCode == 27) this.hide();
			},this);
			$(document).on('keydown',this._removeSM);
		}
	},

	//删除ESC键盘事件
	_removeEscBehaviour: function(){
		this.opts.keyEsc && $(window).unbind('keydown',this._removeSM);
	},

	//设置模态框位置
	_display: function(){
		var offsetTop = $(window).outerHeight(true)*0.5 - this.modal.find('.modal-dialog').outerHeight(true)*0.5;
		offsetTop = this.opts.center && offsetTop > 0 ? offsetTop : this.opts.offsetTop;
		this.modal.find('.modal-dialog').css({
			'position':'retrieve',
			'margin':'auto',
			'top':offsetTop
		});
	},

	//创建flash元素
	_setFlash:function(src){
		if(navigator.userAgent.toLowerCase().indexOf("msie") != -1){
			return this.createElement('OBJECT',{
				'classid':'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000',
				'width':'100%',
				'height':'100%',
				'codebase':'http://active.macromedia.com/flash2/cabs/swflash.cab#version=4,0,0,0',
				'html':'<param name="wmode" value="transparent">\
				<param name="quality" value="high">\
				<param name="allowScriptAccess" value="always">\
				<param name="swLiveConnect" value="false">\
				<param name="movie" value="' + src + '">'
			});
		}else{
			return this.createElement('embed',{
				'type':'application/x-shockwave-flash',
				'PLUGINSPAGE':'http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash',
				'src':src,
				'allowScriptAccess':'always',
				'quality':'high',
				'width':'100%',
				'height':'100%',
				'swLiveConnect':'false',
				'wmode':'transparent'
			});
		}
	},

	//模态Ajax异步请求
	_loadContents: function(param){
		var imgExpr = new RegExp( /([^\/\\]+)\.(jpg|png|gif)$/i ),
			flashExpr = new RegExp( /([^\/\\]+)\.(swf)$/i ),
			videoExpr = new RegExp( /([^\/\\]+)\.(ogg|mp4|webm)$/i );

		if(param.url.match(imgExpr)){

			var image = this.createElement('img',{
				'style':'width:100%;height:auto;',
				'load':function(){

					var modalBody = self.modal.find('.modal-body'),
						height = 0;

					modalBody.append($(this));
					height = modalBody.outerHeight(true);

					modalBody.animate({'height':height},$.proxy(function(){
						self.modal.find('.modal-dialog').removeClass('loading');
						self._addArrows(); $(this).fadeIn('slow');
					},this));

					$(this).hide();	self._display();			
					param.onRequestComplete && param.onRequestComplete($(this));

				}
			}), self = this;
			
			//兼容ie8 onload事件只执行一次，设置图片src属性放在注册onload事件之后
			image.attr('src',param.url);
			this.modal.find('.modal-dialog').addClass('loading');
			param.onRequestReady && param.onRequestReady();

		}else if(param.url.match(flashExpr)){

			var flash = this._setFlash(param.url);
			this.modal.find('.modal-body').append(flash);
			param.onRequestReady && param.onRequestReady();

		}else if(param.url.match(videoExpr)){	

			var video = this.createElement('video',{
				'width':'100%', 'controls':'controls', 'autoplay':'autoplay',
				'html':'<source src="' + param.url + '" type="video/' + param.url.match(videoExpr)[2] + '">\
			Your browser does not support the video tag.',
				'loadedmetadata':function(){
					param.onRequestComplete && param.onRequestComplete($(this));
				}
			});			
			this.modal.find('.modal-body').append(video);
			param.onRequestReady && param.onRequestReady();

		}else{

			var ajaxCallback = function(response,status){

				this._display();

				if(status === 'success')
					param.onRequestComplete && param.onRequestComplete(response);
				else
					param.onError && param.onError(status);
			};
			if(param.postData)
				this.modal.find('.modal-body').load(param.url, param.postData, $.proxy(ajaxCallback,this));
			else
				this.modal.find('.modal-body').load(param.url, $.proxy(ajaxCallback,this));
			param.onRequestReady && param.onRequestReady();

		}
	},

	//加入箭头
	_addArrows: function(){
		var btnnext = this.createElement('a',{
			'href':'javascript:;', 'class':'next-image',
			'html':'<span class="glyphicon glyphicon-chevron-right"></span>',
			'click':$.proxy(function(e){
				e.stopPropagation();
				this._viewNextElement();
			},this),
			'mouseover':function(){
				$(this).css('opacity',0.5);
			},
			'mouseout':function(){
				$(this).css('opacity',0);
			}
		});

		var btnprevious = this.createElement('a',{
			'href':'javascript:;', 'class':'previous-image',
			'html':'<span class="glyphicon glyphicon-chevron-left"></span>',
			'click':$.proxy(function(e){
				e.stopPropagation();
				this._viewPreviousElement();
			},this),
			'mouseover':function(){
				$(this).css('opacity',0.5);
			},
			'mouseout':function(){
				$(this).css('opacity',0);
			}
		});

		this.modal.find('.modal-body').append(btnnext).append(btnprevious);
		this._setArrowsVisibility();
	},

	//右箭头
	_viewNextElement: function(){
		var elements = this.lightbox.group;	
		
		this.lightbox.order++;
		
		var next_element = elements[this.lightbox.order];

		this.show({
			model:'modal-lightbox',
			title:next_element.title,
			draw:false,
			param:{
				'url':next_element.url,
				'onRequestReady':function(){ },
				'onRequestComplete':function(){ }
			},
			lightbox:{
				'element':next_element,
				'group':this.lightbox.group,
				'order':this.lightbox.order
			}
		});
	},

	//左箭头
	_viewPreviousElement: function(){
		var elements = this.lightbox.group;	
				
		this.lightbox.order--;			
		
		var previous_element = elements[this.lightbox.order];
					
		this.show({
			model:'modal-lightbox',
			title:previous_element.title,
			draw:false,
			param:{
				'url':previous_element.url,
				'onRequestReady':function(){ },
				'onRequestComplete':function(){ }
			},
			lightbox:{
				'element':previous_element,
				'group':this.lightbox.group,
				'order':this.lightbox.order
			}
		});	
	},

	//自动设置箭头的可见性
	_setArrowsVisibility: function(){			
		var left_arrow = this.modal.find('.modal-body a.previous-image');		
		var right_arrow = this.modal.find('.modal-body a.next-image');		

		//设置左箭头的可见性（上一个图像）
		if (this.lightbox.order == 0)
			left_arrow.hide();
		else
			left_arrow.show();
	
		//设置右箭头的可见性（下一个图像）
		if (this.lightbox.order >= this.lightbox.group.length-1)
			right_arrow.hide();
		else
			right_arrow.show();
	},

	//遮罩层
	_overlay: function(status) {
		switch(status) {
			case 'show':
				this.mask = this.createElement('div',{
					'class':'modal-backdrop',
					'style':'display:none;background:' + this.opts.overlayColor
					
				});
				$(document.body).append(this.mask);
				this.opts.show ? this.mask.show() : this.mask.fadeTo('slow',this.opts.overlayOpacity);
			break;
			case 'hide':	
				this.opts.show ? this.mask.remove() : this.mask.fadeTo('slow',0,$.proxy(function(){
					this.mask.remove();
				},this));				
			break;
		}	
	},

	//模板
	_template:function(s,d){
		for(var p in d)
			s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
		return s;
	}
};

SuperModal.defaults = {
	width:         600, //模态框宽度
	offsetTop:     30, //偏移
	center:        false, //是否居中
	autoClose:     false, //是否自动关闭
	timeout:       3000, //自动关闭倒计时，单位:毫秒
	overlayOpacity:0.5, //遮罩层透明度
	overlayColor:  '#000000', //遮罩层颜色
    keyEsc:        true, //键盘上的 esc 键被按下时关闭模态框
    closeButton:   true, // X close button
    hideHeader:    false, //隐藏模态框头部
    hideFooter:    false, //隐藏模态框底部
    show:          false, //模态框初始化之后就立即显示出来
    backdrop:      true, //是否遮罩
    btn_ok:        'OK', // Label
    btn_cancel:    'Cancel', // Label
    skinClassName: null, //皮肤样式名
    onShow:    null, //模态框显示前立即触发该事件
    onShown:     null, //模态框已经显示出来（并且同时在动画效果完成）之后被触发
    onHide:    null, //模态框隐藏前立即触发该事件
    onHidden:     null, //此事件在模态框被隐藏（并且同时在动画效果完成）之后被触发
    template:'<div class="modal">\
    	<div class="modal-dialog">\
        	<div class="modal-content">\
      			<div class="modal-header">\
      				<h4 class="modal-title">{_TITLE_}</h4>\
      			</div>\
      			<div class="modal-body">{_CONTENTS_}</div>\
				<div class="modal-footer"></div>\
      		</div>\
      </div></div>'
};