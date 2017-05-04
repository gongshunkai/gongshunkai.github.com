/*!
 * supermodal.js 2.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2017-5-5
 *
 */
(function(root){

	var SuperModal = root.SuperModal = (function(){

		var dialogCache = [],
			dialog;

		return function(opts){

			opts = opts || {};

			dialog = dialogCache[opts.id];

			if(dialog){

				dialog.__init__(dialog.__opts__);
				return dialog;
			
			}else{

				dialog = new Dialog(opts);

				if(opts.id)
					dialogCache[opts.id] = dialog;
				return dialog;

			}
		};

	})();


	//全局快捷键
	var shortcutKey = {
		'27':function(){ this.hide(); }
	};

	//遮罩层
	var overlay;

	//全局自定义事件
	var Event = {

		//事件集合
		__clients__:[],

		//绑定事件
		on:function(key,fn){
			if(!this.__clients__[key])
				this.__clients__[key] = [];

			//订阅的消息加进缓存列表
			this.__clients__[key].push(fn);

			return this;
		},

		//触发事件
		fire:function(){
			var key = [].shift.call(arguments),
				fns = this.__clients__[key];
			
			//如果没有绑定对应的消息
			if(!fns || fns.length === 0) return this;
			
			for(var i =0, fn; fn=fns[i++];)
				fn.apply(this,arguments);

			return this;
		},

		//移除事件
		off:function(key,fn){
			var fns = this.__clients__[key];
		
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


	/*------------------- 请在此处扩展自定义事件 ----------------------------*/

	//全局自定义事件集合clients将拷贝到SuperModal的属性clients上面
	//

	//固定位置
	Event.on('__DISPLAY__',function(){
		this.__opts__.fixed && this.target.css('position','fixed');
	});

	//动画速度
	Event.on('__DISPLAY__',function(){
		this.__opts__.speed = this.__opts__.show ? 0 : 'slow';
	});

	//加入遮罩层
	Event.on('__DISPLAY__',function(){
		this.__opts__.backdrop && Dialog.overlay.show(this,this.__opts__);
	});

	//加入拖拽
	Event.on('__DISPLAY__',function(){
		this.__opts__.dragAble && new DragDrop(this,this.target,$.extend(this.__opts__,{
			handle:this.target.find('.modal-' + (this.__opts__.hideHeader ? 'body' : 'header'))
		}));
	});

	//加入ESC键盘事件
	Event.on('__DISPLAY__',function(){
		this.__opts__.keyEsc && $.extend(this.__shortcutKey__,shortcutKey);
	});

	//添加皮肤样式名
	Event.on('__DISPLAY__',function(){
		this.__opts__.skinClassName && this.target.addClass(this.__opts__.skinClassName);
	});

	//添加标题图标样式名
	Event.on('__DISPLAY__',function(){
		this.__opts__.iconType && this.target.find('.modal-header').addClass(this.__opts__.iconType);
	});

	//加入模态框按钮
	Event.on('__DISPLAY__',function(){

		var temp = this.__btnObjs__[0];

		var hbs = new HeaderButtons(this,this.target.find('.modal-header'),this.__opts__);
		var fbs = new FooterButtons(this,this.target.find('.modal-footer'),this.__opts__);

		this.__btnObjs__ = [hbs,fbs];

		fbs.__buttons__ = temp.__buttons__;
		
	});

	Event.on('__DISPLAY__',function(){
		//加入最小化按钮
		this.__opts__.minButton && this.__addMinButton__();
		//加入最大化按钮
		this.__opts__.maxButton && this.__addMaxButton__();	
		//加入关闭按钮
		this.__opts__.closeButton && this.__addCloseButton__();
	});

	Event.on('__DISPLAY__',function(){
		//加入对话框
		this.__layers__['modal'] = new Modal(this,this.target,this.__opts__);
		//加入对话框
		this.__layers__['modal-dialog'] = new Layer(this,this.target.find('.modal-dialog'),this.__opts__);
		//加入模态框头部
		this.__layers__['modal-header'] = new Layer(this,this.target.find('.modal-header'),this.__opts__);
		//加入模态框主体
		this.__layers__['modal-body'] = new Layer(this,this.target.find('.modal-body'),this.__opts__);
		//加入模态框底部
		this.__layers__['modal-footer'] = new Layer(this,this.target.find('.modal-footer'),this.__opts__);
	});

	//把对话框对象添加到对话框管理
	Event.on('__DISPLAY__',function(){
		manage.add(this.__layers__['modal']);
	});

	//隐藏模态框头部
	Event.on('__DISPLAY__',function(){
		this.__opts__.hideHeader && this.__hideHeader__();
	});

	//隐藏模态框底部
	Event.on('__DISPLAY__',function(){
		this.__opts__.hideFooter && this.__hideFooter__();
	});


	//注册关闭
	Event.on('__CLOSE__',function(){
		this.hide();
	});

	//注册最小化
	Event.on('__MIN__',function(){
		this.min();
	});

	//注册最大化
	Event.on('__MAX__',function(){
		this.max();
	});

	//注册确认
	Event.on('__CONFIRM__',function(){
		this.__opts__.callback && this.__opts__.callback();
	});

	//注册取消
	Event.on('__CANCEL__',function(){
		this.hide();
	});

	//注册模态框显示前
	Event.on('show',function(){
		this.__opts__.onShow && this.__opts__.onShow();
	});

	//注册模态框显示后
	Event.on('shown',function(){
		this.__opts__.onShown && this.__opts__.onShown();
		//自动关闭模态窗
		this.__opts__.autoClose && setTimeout(this.hide.bind(this),this.__opts__.timeout);
		//自动最小化模态窗
		this.__opts__.autoMin && setTimeout(this.min.bind(this,true),this.__opts__.timeout);
		//自动最大化模态窗
		this.__opts__.autoMax && setTimeout(this.max.bind(this,true),this.__opts__.timeout);
		//默认最小化
		this.__opts__.min && this.min(true);
		//默认最大化
		this.__opts__.max && this.max(true);
	});

	//注册模态框隐藏前
	Event.on('hide',function(){
		this.__opts__.onHide && this.__opts__.onHide();
	});

	//注册模态框隐藏后
	Event.on('hidden',function(){
		this.__opts__.onHidden && this.__opts__.onHidden();
	});

	//注册模态框最小化前
	Event.on('minimize',function(){
		this.target.find('.modal-dialog').addClass('minimize');
		this.__opts__.onMinimize && this.__opts__.onMinimize();
	});

	//注册模态框最小化后
	Event.on('minimized',function(){
		this.__opts__.onMinimized && this.__opts__.onMinimized();
	});

	//注册模态框最大化前
	Event.on('maximize',function(){
		this.target.find('.modal-dialog').addClass('maximize');
		this.__opts__.onMaximize && this.__opts__.onMaximize();
	});

	//注册模态框最大化后
	Event.on('maximized',function(){
		this.__opts__.onMaximized && this.__opts__.onMaximized();
	});

	//注册模态框标准化前
	Event.on('normalize',function(type){
		this.target.find('.modal-dialog').removeClass(type);
		this.__opts__.onNormalize && this.__opts__.onNormalize(type);
	});

	//注册模态框标准化后
	Event.on('normalized',function(type){
		this.__opts__.onNormalized && this.__opts__.onNormalized(type);
	});


	/*********************** 对话框管理类 *******************************/

	var DialogManage = function(){
		//以命名方式保存,便于快速通过id获取
		this.idDialogs = {};
		//以堆栈方式保存所有对话框，最后的元素为栈顶
		this.dialogs = [];
	};

	DialogManage.prototype = {
		//对话框重排序
		sortDialogIdx:function(){
			for(var i=0,len=this.dialogs.length;i<len;i++){
				var dialog = this.dialogs[i];
				dialog.__target__.css('z-index', dialog.__opts__.zindex + i);
			}
		},
		//添加dialog对话框
		add:function(dialog){
			if(!this.getDialog(dialog.__opts__.id)){
				this.dialogs.push(dialog);
				this.idDialogs[dialog.__opts__.id] = dialog;
				this.sortDialogIdx();
			} 
		},
		//删除对话框
		remove:function(dialog){
			dialog.clean();
			delete this.idDialogs[dialog.__opts__.id]; 
			var idx = this.getIdx(dialog);
			this.dialogs.splice(idx,1);
			this.sortDialogIdx();
		},
		//交换对话框位置
		swap:function(from,to){
			if(from>=0&&from<=this.dialogs.length-1
			&&to>=0&&to<=this.dialogs.length-1){
				var dialog = this.layers[from];
				this.dialogs[from] = this.dialogs[to];
				this.dialogs[to] = dialog;
				this.sortDialogIdx();
			}
		},
		//获取某个对话框的索引
		getIdx:function(dialog){		  
			return dialog.__target__.css('z-index') - dialog.__opts__.zindex;
		},
		//把某个对话框移动到最顶部
		bringToFirst:function(dialog){
			var idx = this.getIdx(dialog);
			if(idx!=this.dialogs.length-1){
				this.dialogs.splice(idx,1);
				this.dialogs[this.dialogs.length] = dialog;	
				this.sortDialogIdx();
			}
		},
		//把某个对话框移动到最底部
		bringToLast:function(dialog){
			var idx = this.getIdx(dialog);
			if(idx!=0){
				this.dialogs.splice(idx,1);
				this.dialogs.splice(0,0,dialog);
				this.sortDialogIdx();
			}
		},
		//对话框后移
		back:function(dialog){
			var idx = this.getIdx(dialog);
			if(idx>0){
				this.swap(idx,idx-1);
			}		 
		},
		//对话框前移
		forward:function(dialog){
			var idx = this.getIdx(dialog);
			if(idx<this.layers.length){			 
				this.swap(idx,idx+1);
			}
		},
		//根据id获取层
		getDialog:function(id){
			return this.idDialogs[id];
		}, 
		//获取当前对话框,顶部对话框为当前对话框
		getCurrentDialog:function(){
			return this.dialogs[this.dialogs.length-1];
		}, 
		//清除所有对话框
		clearAll:function(){
			for(var i in this.dialogs){
				this.dialogs[i].clean();
			}
			this.idDialogs = {};
			this.dialogs = [];
		}
	};


	/*********************** 按钮类 *******************************/

	//按钮基类
	var BaseButtons = function(context,container,options){
		//按钮集合
		this.__buttons__ = [];
		//执行上下文
		this.__context__ = context;
		//容器对象
		this.__container__ = container;
		//配置参数
		this.__opts__ = options;
	};

	BaseButtons.prototype = {
		//修复构造函数指向
		constructor:BaseButtons,
		//创建按钮
		__createButton__:function(label,classe,clickEvent){
			return createElement('button',{
				'type':'button',
				'html':label,
				'class':classe,
				'click':clickEvent.bind(this.__context__)
			});
		},
		//添加按钮
		addButton:function(/*label,classe,clickEvent,callback*/){
			var args = [].slice.call(arguments),
				callback = args[3],
				self = this;			

			var btn = function(){
				callback && callback.apply(self,args);
				return self.__createButton__.apply(self,args);
			}();
			
			this.__buttons__.push(btn);
			return btn;
		},
		//添加按钮代理
		proxyAddButton:function(label,classe,clickEvent,shortcutKey){
			return this.addButton(label,classe,clickEvent,function(){
				this.__context__.addShortcutKey(shortcutKey,clickEvent);
			});	
		},
		//安装按钮
		injectAllButtons:function(){
			this.__buttons__.forEach(function(e){
				this.__container__.append(e);
			}.bind(this));
		}
	};


	//模态框头部的按钮:继承按钮基类
	var HeaderButtons = function(){
		//继承属性
	    BaseButtons.apply(this,arguments);
	};


	//模态框底部的按钮:继承按钮基类
	var FooterButtons = function(){
		//继承属性
	    BaseButtons.apply(this,arguments);
	};



	//继承基类的方法
	$.extend(HeaderButtons.prototype,BaseButtons.prototype);
	$.extend(FooterButtons.prototype,BaseButtons.prototype);

	//重写安装按钮
	HeaderButtons.prototype.injectAllButtons = function(){
		this.__buttons__.forEach(function(e){
			this.__container__.prepend(e);
		}.bind(this));
	};


	/*------------------- 请在此处扩展按钮的方法 ----------------------------*/

	//加入关闭按钮
	HeaderButtons.prototype.addCloseButton = function(){
		return this.proxyAddButton(this.__opts__.btn_close_type === 'img' ? '<span></span>' : this.__opts__.btn_close, 'close', function(){ this.fire('__CLOSE__'); }, this.__opts__.btn_close_shortcutKey);
	};

	//加入最小化按钮
	HeaderButtons.prototype.addMinButton = function(){
		return this.proxyAddButton('<span></span>', 'min', function(){ this.fire('__MIN__'); }, this.__opts__.btn_min_shortcutKey);
	};

	//加入最大化按钮
	HeaderButtons.prototype.addMaxButton = function(){
		return this.proxyAddButton('<span></span>', 'max', function(){ this.fire('__MAX__'); }, this.__opts__.btn_max_shortcutKey);
	};

	//加入确定按钮
	FooterButtons.prototype.addConfirmButton = function(){
		return this.proxyAddButton(this.__opts__.btn_ok, 'btn btn-primary', function(){ this.fire('__CONFIRM__'); }, this.__opts__.btn_ok_shortcutKey);
	};

	//加入取消按钮
	FooterButtons.prototype.addCancelButton = function(){
		return this.proxyAddButton(this.__opts__.btn_cancel, 'btn btn-default', function(){ this.fire('__CANCEL__'); }, this.__opts__.btn_cancel_shortcutKey);
	};



	/*********************** 层类 *******************************/

	var Layer = function(supermodal,target,options){

		this.__supermodal__ = supermodal;
		this.__target__ = target;
		this.__opts__ = $.extend({},options);
	};

	Layer.prototype = {
		//修复构造函数指向
		constructor:Layer,
		//获取位置
		getPos:function(){
			return {
				x:this.__target__.offset().left,
				y:this.__target__.offset().top
			};
		},
		//设置位置
		setPos:function(x,y){
			this.__opts__.x = x || this.__opts__.x;
			this.__opts__.y = y || this.__opts__.y;
			this.__target__.css('left',this.__opts__.x);
			this.__target__.css('top',this.__opts__.y);
		},
		//获取大小
		getSize:function(){
			return {
				w:this.__target__.outerWidth(true),
				h:this.__target__.outerHeight(true)
			};
		},
		//设置大小
		setSize:function(w,h){
			this.__opts__.w = w || this.__opts__.w;
			this.__opts__.h = h || this.__opts__.h;
			this.__target__.width(this.__opts__.w);
			this.__target__.height(this.__opts__.h);
		},
		//设置背景色
		setColor:function(color){
			this.__opts__.color = color || this.__opts__.color;
			this.__target__.css('background-color',this.__opts__.color);
		},
		//显示
		show:function(){
			this.__target__.show();
		},
		//隐藏
		hide:function(){
			this.__target__.hide();
		},
		//淡出
		fadeOut:function(speed,callback){
			this.__target__.fadeOut(speed,callback);
		},
		//淡入
		fadeIn:function(speed,callback){
			this.__target__.fadeIn(speed,callback);
		},
		//向下滑动
		slideDown:function(speed,callback){
			this.__target__.stop().slideDown(speed,callback);
		},
		//向上滑动
		slideUp:function(speed,callback){
			this.__target__.stop().slideUp(speed,callback);
		},
		//动画
		animate:function(params,speed,callback){
			this.__target__.stop().animate(params,speed,callback);
		},
		//删除元素
		clean:function(){
			this.__target__.remove();
		}
	};


	/*------------------- 请在此处扩展静态方法 ----------------------------*/

	Layer.position = {
		//左上
		'1':function(){
			this.__target__.css({
				'top':0,'right':'auto',
				'bottom':'auto','left':0
			});
		},
		//中上
		'2':function(){
			this.__target__.css({
				'top':0,'right':'auto',
				'bottom':'auto','left':Layer.center(this.__opts__.w)
			});
		},
		//右上
		'3':function(){
			this.__target__.css({
				'top':0,'right':0,
				'bottom':'auto','left':'auto'
			});
		},
		//左中
		'4':function(){
			this.__target__.css({
				'top':Layer.middle(this.__opts__.h),'right':'auto',
				'bottom':'auto','left':0
			});
		},
		//居中
		'5':function(){
			this.__target__.css({
				'top':Layer.middle(this.__opts__.h),'right':'auto',
				'bottom':'auto','left':Layer.center(this.__opts__.w)
			});
		},
		//右中
		'6':function(){
			this.__target__.css({
				'top':Layer.middle(this.__opts__.h),'right':0,
				'bottom':'auto','left':'auto'
			});
		},
		//左下
		'7':function(){
			this.__target__.css({
				'top':'auto','right':'auto',
				'bottom':0,'left':0
			});
		},
		//中下
		'8':function(){
			this.__target__.css({
				'top':'auto','right':'auto',
				'bottom':0,'left':Layer.center(this.__opts__.w)
			});
		},
		//右下
		'9':function(){
			this.__target__.css({
				'top':'auto','right':0,
				'bottom':0,'left':'auto'
			});
		},
		//自定义
		'custom':function(){
			this.__target__.css({
				'top':this.__opts__.topY,'right':0,
				'bottom':0,'left':this.__opts__.leftX
			});
		}
	};

	//水平居中
	Layer.center = function(w){
		var x = $(window).width() * 0.5 - w * 0.5;
		return Math.max(x,0);
	};

	//垂直居中
	Layer.middle = function(h){
		var y = $(window).height() * 0.5 - h * 0.5;
		return Math.max(y,0);
	};

	//克隆节点
	Layer.cloneNode = function(target,callback){

		//参数重载
		if(typeof target === 'function'){
			callback = target;
			target = this.__target__;
		}
		
		//克隆节点
		var tempNode = target.clone();

		//设置样式在页面不可见，但是可以获取到宽高
		tempNode.css({'position':'absolute','visibility':'hidden'}).show();

		//添加克隆节点到页面
		$(document.body).append(tempNode);

		//执行回调函数
		callback && callback.call(this,tempNode);

		//删除克隆节点
		tempNode.remove();

	};



	//模态窗对话框：继承自Layer基类
	var Modal = function(){
		Layer.apply(this,arguments);
	};

	//遮罩层：继承自Layer基类
	var Overlay = function(){
		Layer.apply(this,arguments);
		this.setPos();
		this.setSize();
		this.setColor();
		this.setOpacity();
		this.__bindEvent__();
	};


	//继承基类的方法
	$.extend(Modal.prototype,Layer.prototype);
	$.extend(Overlay.prototype,Layer.prototype);


	/*------------------- 请在此处扩展Layer层子类的方法 ----------------------------*/

	Modal.prototype.init = function(){
		this.__setSize__();
		this.__setPos__();
		this.__setTabindex__();
		this.__bindEvent__();
		this.setSize();	
	};

	Modal.prototype.show = function(){

		this.fadeIn(this.__opts__.speed,function(){
			this.__supermodal__.fire('shown');
		}.bind(this));

	};

	Modal.prototype.hide = function(){

		this.fadeOut(this.__opts__.speed,function(){

			this.__supermodal__.fire('hidden');

			//销毁模态窗
			if(this.__opts__.closeType == 'close'){
				manage.remove(this);
				Dialog.overlay.distory();
				this.__supermodal__.distory();
			}

		}.bind(this));

	};

	Modal.prototype.__bindEvent__ = function(){

		this.__opts__.clickBoxClose && this.__target__.on('dblclick',this.hide.bind(this));
		
		this.__target__.on('mousedown',function(){
			manage.bringToFirst(this);
		}.bind(this));

	};

	//设置tabindex
	Modal.prototype.__setTabindex__ = function(){
		this.__target__.attr('tabIndex','-1');
	};

	Modal.prototype.__setSize__ = function(){

		Layer.cloneNode.call(this,function(node){

			var w = node.outerHeight(true),
				h = node.outerHeight(true);

			this.__opts__.w = node.width(this.__opts__.width).width();
			this.__opts__.h = node.height(this.__opts__.height).height();

			var bodyHeight = node.find('.modal-body').height();

			this.__supermodal__.setBodyHeight(this.__opts__.h - h + bodyHeight);
		});
	};

	Modal.prototype.__setPos__ = function(){
		Layer.position[this.__opts__.position].call(this);
	};


	//设置透明度
	Overlay.prototype.setOpacity = function(opacity){
		this.__opts__.opacity = opacity || this.__opts__.opacity;
		this.__target__.css('opacity',this.__opts__.opacity);
	};

	Overlay.prototype.__bindEvent__ = function(){

		if(this.__opts__.backdrop){
			this.__target__.on(this.__opts__.clickBgClose,this.__supermodal__.hide.bind(this.__supermodal__));
		}

	};


	/*********************** lightBox类 *******************************/
			
	var LightBox = function(supermodal,body,lightbox){
		this.__supermodal__ = supermodal;
		this.__body__ = body;
		this.__lightbox__ = lightbox;
	};

	LightBox.prototype = {
		//修复构造函数指向
		constructor:LightBox,
		//加入箭头
		addArrows:function(){
			var btnnext = createElement('a',{
				'href':'javascript:;', 'class':'next-image',
				'html':'<span class="glyphicon glyphicon-chevron-right"></span>',
				'click':function(e){
					e.stopPropagation();
					this.viewNextElement();
				}.bind(this),
				'mouseover':function(){
					$(this).css('opacity',0.5);
				},
				'mouseout':function(){
					$(this).css('opacity',0);
				}
			});

			var btnprevious = createElement('a',{
				'href':'javascript:;', 'class':'previous-image',
				'html':'<span class="glyphicon glyphicon-chevron-left"></span>',
				'click':function(e){
					e.stopPropagation();
					this.viewPreviousElement();
				}.bind(this),
				'mouseover':function(){
					$(this).css('opacity',0.5);
				},
				'mouseout':function(){
					$(this).css('opacity',0);
				}
			});

			this.__body__.append(btnnext).append(btnprevious);
			this.setArrowsVisibility(btnprevious,btnnext);
		},

		//右箭头
		viewNextElement:function(){
			var elements = this.__lightbox__.group;	
			
			this.__lightbox__.order++;
			
			var next_element = elements[this.__lightbox__.order];

			this.__supermodal__.display({
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
					'group':this.__lightbox__.group,
					'order':this.__lightbox__.order
				}
			});
		},

		//左箭头
		viewPreviousElement:function(){
			var elements = this.__lightbox__.group;	
					
			this.__lightbox__.order--;			
			
			var previous_element = elements[this.__lightbox__.order];
						
			this.__supermodal__.display({
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
					'group':this.__lightbox__.group,
					'order':this.__lightbox__.order
				}
			});	
		},

		//自动设置箭头的可见性
		setArrowsVisibility:function(left_arrow,right_arrow){		

			//设置左箭头的可见性（上一个图像）
			if (this.__lightbox__.order == 0)
				left_arrow.hide();
			else
				left_arrow.show();
		
			//设置右箭头的可见性（下一个图像）
			if (this.__lightbox__.order >= this.__lightbox__.group.length-1)
				right_arrow.hide();
			else
				right_arrow.show();
		}
	};


	/*********************** LoadContents类 *******************************/

	var LoadContents = function(supermodal,target,params){
		this.__supermodal__ = supermodal;
		this.__target__ = target;
		this.__params__ = params;
	};


	/*------------------- 请在此处扩展静态方法 ----------------------------*/

	//表达式与方法名的映射对象
	LoadContents.exMapping = {};

	//
	LoadContents.media = function(name){

		var LoadContentFn = typeof name === 'string' ? LoadContents[name] : name;

		return function(){
			
			var modalBody = this.__target__.find('.modal-body'),
				params = this.__params__;

			var media = LoadContentFn(params);

			modalBody.append(media);

			params.onRequestReady && params.onRequestReady();
		
		};
	};

	//创建flash
	LoadContents.createFlash = function(params){

		if(navigator.userAgent.toLowerCase().indexOf("msie") != -1){

			return createElement('OBJECT',{
				'classid':'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000',
				'width':'100%',
				'height':'100%',
				'codebase':'http://active.macromedia.com/flash2/cabs/swflash.cab#version=4,0,0,0',
				'html':'<param name="wmode" value="transparent">\
				<param name="quality" value="high">\
				<param name="allowScriptAccess" value="always">\
				<param name="swLiveConnect" value="false">\
				<param name="movie" value="' + params.url + '">'
			});

		}else{

			return createElement('embed',{
				'type':'application/x-shockwave-flash',
				'PLUGINSPAGE':'http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash',
				'src':params.url,
				'allowScriptAccess':'always',
				'quality':'high',
				'width':'100%',
				'height':'100%',
				'swLiveConnect':'false',
				'wmode':'transparent'
			});

		}

	};

	//创建Video
	LoadContents.createVideo = function(params){

		var suffix = params.url.match(LoadContents.exMapping.video)[2];

		return createElement('video',{
			'width':'100%', 'height':'100%', 'controls':'controls', 'autoplay':'autoplay',
			'html':'<source src="' + params.url + '" type="video/' + suffix + '">\
		Your browser does not support the video tag.',
			'loadedmetadata':function(){
				params.onRequestComplete && params.onRequestComplete($(this));
			}
		});		

	};

	//创建iframe
	LoadContents.createIframe = function(params){

		return createElement('iframe',{
			'width':'100%', 'height':'100%',
			'src':params.url, 'frameborder':'0',
			'load':function(){
				params.onRequestComplete && params.onRequestComplete($(this));
			}
		});

	};


	/*------------------- 请在此处扩展 LoadContents.exMapping ----------------------------*/

	LoadContents.exMapping.lightbox = new RegExp( /([^\/\\]+)\.(jpg|png|gif)$/i );
	LoadContents.exMapping.flash = new RegExp( /([^\/\\]+)\.(swf)$/i );
	LoadContents.exMapping.video = new RegExp( /([^\/\\]+)\.(ogg|mp4|webm)$/i );


	/*------------------- 请在此处扩展原型方法 ----------------------------*/

	LoadContents.prototype.lightbox = function(){

		var supermodal = this.__supermodal__,
			modalDialog = this.__target__.find('.modal-dialog'),
			modalBody = this.__target__.find('.modal-body'),
			params = this.__params__,
			height = 0;

		var image = createElement('img',{
			'style':'width:100%;height:auto;',
			'load':function(){

				modalBody.height('auto').append($(this));
				height = modalBody.outerHeight(true);

				//重新设置模态框高度
				supermodal.setSize(undefined,'auto');
				var size = supermodal.getSize();
				supermodal.setSize(size.w,size.h);

				supermodal.__animateBody__({'height':height},function(){
					modalDialog.removeClass('loading');
					supermodal.addArrows(); $(this).fadeIn('slow');
				}.bind(this));

				$(this).hide(); supermodal.__setPosition__();
				params.onRequestComplete && params.onRequestComplete($(this));

			}
		});
		
		//兼容ie8 onload事件只执行一次，设置图片src属性放在注册onload事件之后
		image.attr('src',params.url);
		modalDialog.addClass('loading');
		params.onRequestReady && params.onRequestReady();

	};

	LoadContents.prototype.flash = LoadContents.media('createFlash');

	LoadContents.prototype.video = LoadContents.media('createVideo');

	LoadContents.prototype.iframe = LoadContents.media('createIframe');

	LoadContents.prototype.ajax = function(){

		var modalBody = this.__target__.find('.modal-body'),
			params = this.__params__;

		var ajaxCallback = function(response,status){

			if(status === 'success')
				params.onRequestComplete && params.onRequestComplete(response);
			else
				params.onError && params.onError(status);
		};

		if(params.postData)
			modalBody.load(params.url, params.postData, ajaxCallback.bind(this));
		else
			modalBody.load(params.url, ajaxCallback.bind(this));

		params.onRequestReady && params.onRequestReady();

	};



	/*********************** 拖拽类 *******************************/

	//基类
	var Drag = function(supermodal,drag,options){
		this.__supermodal__ = supermodal;
		this.__drag__ = drag;
		this.__opts__ = $.extend({},options);
	};

	Drag.prototype = {
		//修复构造函数指向
		constructor:Drag,
		start:function(e){},
		
		repair:function(){},
		move:function(){},
		stop:function(e){},
	};

	//拖拽
	var DragDrop = function(){
		Drag.apply(this,arguments);
		this.__opts__.handle.css('cursor','move').on('mousedown',this.start.bind(this));
	};

	//缩放
	var DragResize = function(){
		Drag.apply(this,arguments);
	};

	//继承基类的方法
	$.extend(DragDrop.prototype,Drag.prototype);
	$.extend(DragResize.prototype,Drag.prototype);



	DragDrop.prototype.start = function(e){

		if(this.__opts__.lock)
			return;

		//修正范围
		this.repair();

		//记录鼠标相对拖放对象的位置
		this.__x__ = e.clientX - this.__drag__.position().left;
		this.__y__ = e.clientY - this.__drag__.position().top;

		//记录margin
		this.__marginLeft__ = parseInt(this.__drag__.css('marginLeft')) || 0;
		this.__marginTop__ = parseInt(this.__drag__.css('marginTop')) || 0;

		//mousemove时移动
		$(document).on('mousemove',(function(context){
			return context.__moveFn__ = context.move.bind(context);
		})(this));

		//mouseup时停止
		$(document).on('mouseup',(function(context){
			return context.__stopFn__ = context.stop.bind(context);
		})(this));

		//附加程序
		this.__opts__.dlgEvent.onStart && this.__opts__.dlgEvent.onStart(e);

	};

	//修正范围
	DragDrop.prototype.repair = function(){

		if(this.__opts__.dragRangeLimit){
			//修正错误范围参数
			this.__opts__.mxRight = Math.max(this.__opts__.mxRight, this.__opts__.mxLeft + this.__drag__.outerWidth());
			this.__opts__.mxBottom = Math.max(this.__opts__.mxBottom, this.__opts__.mxTop + this.__drag__.outerHeight());

			//如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
			//!this.__opts__.mxContainer || this.__opts__.mxContainer.css('position') == "relative" || this.__opts__.mxContainer.css('position') == "absolute" || (this.__opts__.mxContainer.css('position','relative'));
		}

	};

	DragDrop.prototype.move = function(e){

		//判断是否锁定
		if(this.__opts__.lock){
			this.stop(); return;
		};

		//设置移动参数
		var iLeft = e.clientX - this.__x__,
			iTop = e.clientY - this.__y__;

		//设置范围限制
		if(this.__opts__.dragRangeLimit){

			//如果设置了容器，再修正范围参数
			if(!!this.__opts__.mxContainer){
				this.__opts__.mxLeft = Math.max(this.__opts__.mxLeft, 0);
				this.__opts__.mxTop = Math.max(this.__opts__.mxTop, 0);
				this.__opts__.mxRight = Math.min(this.__opts__.mxRight, this.__opts__.mxContainer.innerWidth());
				this.__opts__.mxBottom = Math.min(this.__opts__.mxBottom, this.__opts__.mxContainer.innerHeight());
			}

			//修正移动参数
			iLeft = Math.max(Math.min(iLeft, this.__opts__.mxRight - this.__drag__.outerWidth()), this.__opts__.mxLeft);
			iTop = Math.max(Math.min(iTop, this.__opts__.mxBottom - this.__drag__.outerHeight()), this.__opts__.mxTop);
		}

		//设置位置，并修正margin
		if(!this.__opts__.lockX)
			this.__drag__.css('left',iLeft - this.__marginLeft__);

		if(!this.__opts__.lockY)
			this.__drag__.css('top',iTop - this.__marginTop__);

		//附加程序
		this.__opts__.dlgEvent.onMove && this.__opts__.dlgEvent.onMove(e);

	};

	DragDrop.prototype.stop = function(e){

		$(document).off('mousemove',this.__moveFn__);
		$(document).off('mouseup',this.__stopFn__);

		//附加程序
		this.__opts__.dlgEvent.onStop && this.__opts__.dlgEvent.onStop(e);

	};



	DragResize.prototype.start = function(e){

	};
	DragResize.prototype.move = function(e){

	};
	DragResize.prototype.stop = function(e){

	};



	/*********************** 对话框类 *******************************/

	var Dialog = function(){
		this.__init__.apply(this,arguments);
	};

	//继承全局自定义事件
	$.extend(Dialog.prototype,Event,{
		//修复构造函数指向
		constructor:Dialog,
		//初始化
		__init__:function(options){
			//设置参数
			this.__opts__ = $.extend({}, Dialog.defaults, options);

			//自定义事件集合:继承自全局自定义事件集合
			this.__clients__ = $.extend(true,{},Event.__clients__);

			//按钮对象集合
			this.__btnObjs__ = [new BaseButtons(this)];

			//快捷键集合
			this.__shortcutKey__ = this.__shortcutKey__ || [];

			//层集合
			this.__layers__ = this.__layers__ || [];
		},

		//显示模态窗
		__display__:function(options){

			var opts = $.extend({}, options);

			//防止重复创建
			opts.draw = opts.draw == undefined ? true : opts.draw;

			//防止重复创建
			this.__opts__.draw = true;

			//设置id
			this.__opts__.id = this.__opts__.id || Dialog.getTimeTick();

			//渲染模态框
			var appendWindow = this.__drawWindow__(opts);

			//触发自定义事件
			this.fire('__DISPLAY__',opts);

			//切换不同的模式
			this[opts.model] && this[opts.model](opts);

			//加入键盘事件
			this.__addBehaviour__();

			//加入Resize事件
			this.__addResizeBehaviour__();

			//安装按钮
			this.__injectAllButtons__();

			//初始化层
			this.__initAllLayers__();

			//把窗体添加到文档
			appendWindow();
		},

		//销毁模态窗
		__distory__:function(){

			//移除键盘事件
			this.__removeBehaviour__();

			//移除resize事件
			this.__removeResizeBehaviour__();

			this.__opts__.draw = false;

			this.fire('__DISTORY__');

			this.__clients__ = 
				this.__btnObjs__ = 
					this.__layers__ = 
						this.__shortcutKey__ = [];
		},

		//渲染模态窗
		__drawWindow__:function(opts){

			var self = this;

			//设置内容
			var html = $(Dialog.template(this.__opts__.template, {
				"_TITLE_":opts.title || "Untitled",
				"_CONTENTS_":opts.contents || ""
			}));

			//防止重复创建
		    if(opts.draw)
		    	this.target = html;
		    else
		    	this.target.html(html.html());

			//延迟执行
			return function(){

				//加入模态窗
				$(document.body).append(self.target);

				self.__show__();
				
			};	
		}
	});

	//解析模板
	Dialog.template = function(s,d){
		for(var p in d)
			s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
		return s;
	};

	//遮罩层
	Dialog.overlay = {
		//显示
		show:function(supermodal,opts){

			if(!overlay){

				//创建遮罩层
				overlay = createElement('div',{
					'class':'modal-backdrop'
				});

				//加入遮罩层
				$(document.body).append(overlay);

				//创建遮罩层实例对象
				overlay = new Overlay(supermodal,overlay,$.extend({},opts,{
					id:Dialog.getTimeTick(),
					w:'100%',h:'100%',
					color:opts.overlayColor,opacity:opts.overlayOpacity
				}));

				//把遮罩层实例对象添加到对话框管理
				manage.add(overlay);
			}
		},
		//销毁
		distory:function(){

			if(overlay){
				manage.remove(overlay);
				overlay = null;
			}

		}
	};

	Dialog.getTimeTick = function(){
		return new Date().getTime();
	};

	//默认配置
	Dialog.defaults = {
		width:         600, //模态框宽度
		height:        300, //模态框高度
		zindex:        9999, //层级
		position: '5', //窗体初始位置 1-左上角 2-中上 3-右上角 4-左中 5-居中 6-右中 7-左下角 8-中下 9-右下角 'custom'-自定义
		leftX: 0, //自定义位置 x
		topY: 0, //自定义位置 y
		iconType: '', //'warning','confirm','question','error','info'
		autoClose:     false, //是否自动关闭
		autoMin:     false, //是否自动最小化
		autoMax:     false, //是否自动最大化
		timeout:       3000, //倒计时，单位:毫秒
		closeType:     'close', //关闭方式 'close','hide'
		clickBgClose: 'dblclick', //true,'dblclick','click',false
		clickBoxClose: false, //true,'dblclick',false
		overlayOpacity:0.5, //遮罩层透明度
		overlayColor:  '#000000', //遮罩层颜色
	    keyEsc:        true, //键盘上的 esc 键被按下时关闭模态框
	    minButton:     false, // 最小化按钮
	    maxButton:     false, // 最大化按钮
	    closeButton:   true, // X close button
	    hideHeader:    false, //隐藏模态框头部
	    hideFooter:    false, //隐藏模态框底部
	    max: false, //默认最大化，true:最大化，false:标准大小
		min: false, //默认最小化，true:最小化，false:标准大小
	    show:          false, //模态框初始化之后就立即显示出来
	    backdrop:      true, //是否遮罩
	    btn_ok:        '确定', // Label
	    btn_cancel:    '取消', // Label
	    btn_close:     '关闭', // Label
	    btn_close_type: 'img', //关闭按钮类型样式 'img','text'
	    btn_ok_shortcutKey:null, //确定按钮快捷键
	    btn_cancel_shortcutKey:null, //取消按钮快捷键
	    btn_close_shortcutKey:null, //关闭按钮快捷键
	    btn_min_shortcutKey:null, //最小化按钮快捷键
	    btn_max_shortcutKey:null, //最大化按钮快捷键
	    skinClassName: null, //皮肤样式名
	    callback:null, //确认框回调函数

	    dragAble: true, //是否允许拖动
		dragMask: true, //移动遮盖层
		dragRangeLimit: true, //窗体拖动范围限制 true,false (为true时下面参数有用,可以是负数)
		mxLeft: 0, //左边限制
		mxRight: 9999, //右边限制
		mxTop: 0, //上边限制
		mxBottom: 9999, //下边限制
		mxContainer: $(window), //指定限制在容器内
		fixed: true, //是否固定位置
		lockX: false, //是否锁定水平方向拖放
		lockY: false, //是否锁定垂直方向拖放
		lock: false, //是否锁屏
		topMost: true, //是否允许显示在其它窗体最上面
		dlgEvent: {  //拖拽事件代理
			'onStart':null,'onMove':null,'onStop':null
		},		
	    onShow:    null, //模态框显示前立即触发该事件
	    onShown:     null, //模态框已经显示出来（并且同时在动画效果完成）之后被触发
	    onHide:    null, //模态框隐藏前立即触发该事件
	    onHidden:     null, //此事件在模态框被隐藏（并且同时在动画效果完成）之后被触发
	    onMinimize:     null, //模态框最小化前立即触发该事件
	    onMinimized:null, //模态框已经最小化（并且同时在动画效果完成）之后被触发
	    onMaximize:     null, //模态框最大化前立即触发该事件
	    onMaximized:null, //模态框已经最大化（并且同时在动画效果完成）之后被触发
	    onNormalize:  null, //模态框标准化前立即触发该事件
		onNormalized:  null, //模态框已经标准化（并且同时在动画效果完成）之后被触发
	    template:'<div class="modal">\
	    	<div class="modal-dialog">\
	        	<div class="modal-content">\
	      			<div class="modal-header">\
	      				<h4 class="modal-title"><i></i> {_TITLE_}</h4>\
	      			</div>\
	      			<div class="modal-body">{_CONTENTS_}</div>\
					<div class="modal-footer"></div>\
	      		</div>\
	      </div></div>'
	};




	/*------------------- 请在此处扩展私有方法 ----------------------------*/


	//显示模态框
	Dialog.prototype.__show__ = function(){

		this.fire('show');

		this.__layers__['modal'].show();

		if(this.__opts__.backdrop){
			
			//遮罩层可能已被销毁，再创建一次并防止遮罩层位于模态窗上面
			!overlay && Dialog.overlay.show(this,$.extend({},this.__opts__,{
				zindex:this.__opts__.zindex-2
			}));
			
			overlay.fadeIn(this.__opts__.speed);
		}

	};

	//隐藏模态框
	Dialog.prototype.__hide__ = function(){

		this.fire('hide');

		this.__layers__['modal'].hide();

		overlay && overlay.fadeOut(this.__opts__.speed);

	};

	//加入关闭按钮
	Dialog.prototype.__addCloseButton__ = function(){
		this.__btnObjs__[0].addCloseButton();
	};

	//加入最小化按钮
	Dialog.prototype.__addMinButton__ = function(){
		this.__btnObjs__[0].addMinButton();
	};

	//加入最大化按钮
	Dialog.prototype.__addMaxButton__ = function(){
		this.__btnObjs__[0].addMaxButton();
	};

	//加入确认按钮
	Dialog.prototype.__addConfirmButton__ = function(){
		this.__btnObjs__[1].addConfirmButton();
	};

	//加入取消按钮
	Dialog.prototype.__addCancelButton__ = function(){
		this.__btnObjs__[1].addCancelButton();
	};

	//安装按钮
	Dialog.prototype.__injectAllButtons__ = function(){
		this.__btnObjs__.forEach(function(e){
			e.injectAllButtons();
		});
	};

	//初始化层
	Dialog.prototype.__initAllLayers__ = function(){
		for(var i in this.__layers__){
			var layer = this.__layers__[i];
			layer.init && layer.init();
		}
	};

	//是否最小化
	Dialog.prototype.__isMinimize__ = function(){
		return this.target.find('.modal-body').is(':hidden') && this.target.find('.modal-footer').is(':hidden');
	};

	//最小化
	Dialog.prototype.__minimize__ = (function(){

		var isMin = false, //是否最小化标识
			lastSize = {}; //缓存模态窗尺寸

		return function(mode){

			if(mode || !isMin){

				//保存最后一次的尺寸
				lastSize = this.getSize();

				//设置尺寸
				this.setSize(undefined,'auto');
				//触发最小化事件
				this.fire('minimize');

				//隐藏主体
				this.__slideUpBody__(function(){
					this.fire('minimized');
				}.bind(this));
				//隐藏底部
				!this.__opts__.hideFooter && this.__slideUpFooter__();

			}else{

				//还原尺寸
				this.setSize(undefined,lastSize.h);
				//触发标准化事件
				this.fire('normalize','minimize');

				//显示主体
				this.__slideDownBody__(function(){
					this.fire('normalized','minimize');
				}.bind(this));
				//显示底部
				!this.__opts__.hideFooter && this.__slideDownFooter__();
		
			}
			
			isMin = mode || !isMin;

		};

	})();

	//最大化
	Dialog.prototype.__maximize__ = (function(){

		var isMax = false, //是否最大化标识
			lastSize = {}, //缓存模态窗尺寸
			lastPos = {}, //缓存模态窗位置
			lastBodyHeight, //缓存主体高度
			normalModalHeight, //标准化模态框高度
			maxBodyHeight; //最大化主体高度

		return function(mode){

			if(mode || !isMax){

				//保存最后一次的尺寸和位置
				lastSize = this.getSize();
				lastPos = this.getPos();

				//保存主体高度
				lastBodyHeight = this.getBodyHeight();

				//获取标准化模态框高度
				normalModalHeight = this.__getNormalModalHeight__();

				//获取最大化主体高度
				maxBodyHeight = this.__getMaxBodyHeight__();

				//设置最大化窗口resize事件
				this.__setMaxResize__();
				//触发最大化事件
				this.fire('maximize');

				//设置尺寸和位置
				this.__animateModal__({'width':$(window).width(),'height':this.__isMinimize__() ? lastSize.h : $(window).height(),'top':0,'left':0},function(){
					this.fire('maximized');
				}.bind(this));
				this.__animateBody__({'height':maxBodyHeight});

			}else{

				//设置标准窗口resize事件
				this.__setNormalResize__();
				//触发标准化事件
				this.fire('normalize','maximize');

				//还原尺寸和位置
				this.__animateModal__({'width':lastSize.w,'height':this.__isMinimize__() ? lastSize.h : normalModalHeight,'left':lastPos.x,'top':lastPos.y},function(){
					this.fire('normalized','maximize');
				}.bind(this));
				this.__animateBody__({'height':lastBodyHeight});

			}

			isMax = mode || !isMax;
		};

	})();


	//加入键盘事件
	Dialog.prototype.__addBehaviour__ = function(){
		//先off再on防止重复绑定事件
		this.target.off('keydown').on('keydown',function(e){
			typeof this.__shortcutKey__[e.keyCode] === 'function' && this.__shortcutKey__[e.keyCode].call(this);
		}.bind(this));
	};

	//删除键盘事件
	Dialog.prototype.__removeBehaviour__ = function(){
		this.target.off('keydown');
	};

	//添加resize事件
	Dialog.prototype.__addResizeBehaviour__ = function(max){

		//先off再on防止重复绑定事件
		$(window).off('resize',this.__resizeFn__).on('resize',(function(context){
			return context.__resizeFn__ = throttle(function(){

				if(max){

					context.setSize($(window).width(),$(window).height());
					context.setBodyHeight(context.__getMaxBodyHeight__());

				}else{
					context.__setPosition__();
				}
				
			},100);

		})(this));
	};

	//删除resize事件
	Dialog.prototype.__removeResizeBehaviour__ = function(){
		$(window).off('resize',this.__resizeFn__);	
	};

	//设置最大化窗口resize事件
	Dialog.prototype.__setMaxResize__ = function(){
		this.__addResizeBehaviour__(true);
	};

	//设置标准窗口resize事件
	Dialog.prototype.__setNormalResize__ = function(){
		this.__addResizeBehaviour__();
	};

	//隐藏模态框头部
	Dialog.prototype.__hideHeader__ = function(){
		this.__layers__['modal-header'].hide();
	};

	//隐藏模态框主体
	Dialog.prototype.__hideBody__ = function(){
		this.__layers__['modal-body'].hide();
	};

	//隐藏模态框底部
	Dialog.prototype.__hideFooter__ = function(){
		this.__layers__['modal-footer'].hide();
	};

	//显示模态框头部
	Dialog.prototype.__showHeader__ = function(){
		this.__layers__['modal-header'].show();
	};

	//显示模态框头部
	Dialog.prototype.__showBody__ = function(){
		this.__layers__['modal-body'].show();
	};

	//显示模态框底部
	Dialog.prototype.__showFooter__ = function(){
		this.__layers__['modal-footer'].show();
	};

	//获取标准化模态框高度
	Dialog.prototype.__getNormalModalHeight__ = function(){

		var height = 0;

		Layer.cloneNode.call(this.__layers__['modal'],function(node){

			node.find('.modal-body').show();
			node.find('.modal-footer').show();
			height = node.height('auto').outerHeight(true);

		});

		return height;

	};

	//获取最大化主体高度
	Dialog.prototype.__getMaxBodyHeight__ = function(){

		var height = 0, self = this;

		['modal-header','modal-footer'].forEach(function(name){

			//克隆头部与底部的节点，获取它们的高度之和
			Layer.cloneNode.call(self.__layers__[name],function(node){
				height += node.width('100%').outerHeight(true);
			});

		});

		//返回主体高度 ( 文档高度 - 头部高度 - 底部高度 = 主体高度 )
		return $(window).height() - height;

	};

	Dialog.prototype.__setPosition__ = function(){
		Layer.position[this.__opts__.position].call(this.__layers__['modal']);
	};

	//主体向下滑动
	Dialog.prototype.__slideDownBody__ = function(callback){
		this.__layers__['modal-body'].slideDown(this.__opts__.speed,callback);
	};

	//底部向下滑动
	Dialog.prototype.__slideDownFooter__ = function(){
		this.__layers__['modal-footer'].slideDown(this.__opts__.speed);
	};

	//主体向上滑动
	Dialog.prototype.__slideUpBody__ = function(callback){

		var func = function(){
			this.setSize(undefined,this.getSize().h);
			callback && callback();
		}.bind(this);

		this.__layers__['modal-body'].slideUp(this.__opts__.speed,func);
	};

	//底部向上滑动
	Dialog.prototype.__slideUpFooter__ = function(){
		this.__layers__['modal-footer'].slideUp(this.__opts__.speed);
	};

	//模态窗动画
	Dialog.prototype.__animateModal__ = function(params,callback){

		var func = function(){
			this.setSize(params.width,params.height);
			callback && callback();
		}.bind(this);

		this.__layers__['modal'].animate(params,this.__opts__.speed,func);
	};

	//主体动画
	Dialog.prototype.__animateBody__ = function(params,callback){
		this.__layers__['modal-body'].animate(params,this.__opts__.speed,callback);
	};

	//模态Ajax异步请求
	Dialog.prototype.__loadContents__ = function(params){

		var loadContents, loadContentExpr, loadContentFn, expr;

		loadContents = new LoadContents(this,this.target,params);
		
		for(var name in loadContentExpr = LoadContents.exMapping){

			expr = loadContentExpr[name];

			if(params.url.match(expr))
				loadContentFn = loadContents[name];
		}

		if(!loadContentFn){

			var regex = /([^\.\/]+\.[^\.\/]+)\//, //匹配顶级域名
				hostname = location.hostname + '/', //域名
	    		domain = hostname.match(regex); //顶级域名
				
			//是否域名跨域
			var isCrossDomain = regex.test(params.url) && params.url.indexOf(domain) == -1;

			//如果域名跨域则调用iframe
			loadContentFn = loadContents[ isCrossDomain ? 'iframe' : 'ajax' ];

		}

		//执行方法
		loadContentFn.call(loadContents);
		
	};



	/*------------------------- 请在此处扩展公有方法 ---------------------------------*/

	//添加快捷键
	Dialog.prototype.addShortcutKey = function(shortcutKey,clickEvent){
		this.__shortcutKey__[shortcutKey] = clickEvent;
	};

	//获取对话框位置
	Dialog.prototype.getPos = function(){
		return this.__layers__['modal'].getPos();
	};

	//设置对话框位置
	Dialog.prototype.setPos = function(x,y){
		this.__layers__['modal'].setPos(x,y);
	};

	//获取对话框大小
	Dialog.prototype.getSize = function(){
		return this.__layers__['modal'].getSize();
	};

	//设置对话框大小
	Dialog.prototype.setSize = function(w,h){
		return this.__layers__['modal'].setSize(w,h);
	};

	//获取主体高度
	Dialog.prototype.getBodyHeight = function(){
		var size = this.__layers__['modal-body'].getSize();
		return size.h;
	};

	//设置主体高度
	Dialog.prototype.setBodyHeight = function(h){
		this.__layers__['modal-body'].setSize(undefined,h);
	};

	//添加listbox的左右箭头
	Dialog.prototype.addArrows = function(){

		var supermodal = this,
			modalbody = this.target.find('.modal-body'),
			params = this.lightbox;

		var lightbox = new LightBox(supermodal,modalbody,params);

		lightbox.addArrows();
		
	};

	Dialog.prototype.display = function(options){
		this.__display__(options);
	};


	/*------------------- 请在此处扩展模态框的模式 ----------------------------*/

	//提示框模式
	Dialog.prototype['modal-alert'] = function(){
		//加入确认按钮
		this.__addConfirmButton__();
	};

	//确认框模式
	Dialog.prototype['modal-confirm'] = function(){
		//加入取消按钮
		this.__addCancelButton__();
		//加入确认按钮
		this.__addConfirmButton__();
	};

	//消息框模式
	Dialog.prototype['modal-message'] = function(){
		//隐藏模态框头部
	    this.__hideHeader__();
	    //加入确认按钮
		this.__addConfirmButton__();
	};

	//ajax模式
	Dialog.prototype['modal-ajax'] = function(opts){

		this.__loadContents__({
			'url':opts.param.url,
			'onRequestReady':opts.param.onRequestReady,
			'onRequestComplete':opts.param.onRequestComplete,
			'onError':opts.param.onError
		});

	};

	//lightbox模式
	Dialog.prototype['modal-lightbox'] = function(opts){

		//隐藏模态框底部
	    this.__hideFooter__();

		//设置lightbox参数
		this.lightbox = {
			'element':opts.lightbox.element,
			'group':opts.lightbox.group,
			'order':opts.lightbox.order
		};

		this.__loadContents__({
			'url':opts.param.url,
			'order':this.lightbox.order,
			'onRequestReady':opts.param.onRequestReady,
			'onRequestComplete':opts.param.onRequestComplete
		});

	};



	/*------------------------- 请在此处扩展外部调用的方法 ---------------------------------*/


	Dialog.prototype.show = function(options){

		if(!this.__opts__)
			throw new Error('模态窗已经被销毁');

		if(this.__opts__.draw)
			this.__show__();
		else
			this.__display__(options);

		return this;
	};

	Dialog.prototype.hide = function(){
		this.__hide__();
		return this;
	};

	Dialog.prototype.distory = function(){
		this.__distory__();
		return this;
	};

	Dialog.prototype.min = function(mode){
		this.__minimize__(mode);
		return this;
	};

	Dialog.prototype.max = function(mode){
		this.__maximize__(mode);
		return this;
	};

	//加入按钮 ( 形参顺序换了一下，方便外部调用 )
	Dialog.prototype.addButton = function(label,classe,shortcutKey,clickEvent){
		this.__btnObjs__[0].proxyAddButton(label,classe,clickEvent,shortcutKey);
		return this;
	};


	/*********************** 工具方法 *******************************/

	function createElement(tag,obj){

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
	};

	//函数节流的通用方法
	function throttle(fn,interval){

	    var _self = fn,//保存需要被延迟执行的函数引用
	        timer,//定时器
	        firstTime = true;//是否是第一次调用

	    return function(){
	        var args = arguments,
	            _me = this;

	        if(firstTime){//如果是第一次调用，不需延迟执行
	            _self.apply(_me,args);
	            return firstTime = false;
	        }

	        if(timer){//如果定时器还在，说明前一次延迟执行还没有完成
	            return false;
	        }

	        timer = setTimeout(function(){//延迟一段时间执行
	            clearTimeout(timer);
	            timer = null;
	            _self.apply(_me,args);
	        },interval || 500);
	    };

	};


	//用bind改变this指向
	Function.prototype.bind = Function.prototype.bind || function(context) {
	    var self = this; //保存原函数
	    return function() { //返回一个新的函数
	        return self.apply(context, arguments); //执行新的函数的时候，会把之前传入的context当作新的函数体内的this
	    }
	};

	Array.prototype.forEach = Array.prototype.forEach || function(fun /*, thisp*/){  
	    var len = this.length;  
	    if (typeof fun != "function")  
	        throw new TypeError();  
	        var thisp = arguments[1];  
	    for (var i = 0; i < len; i++){  
	        if (i in this)  
	            fun.call(thisp, this[i], i, this);  
	    }
	};


	//对话框管理
	var manage = new DialogManage();

})(this);