﻿//     jutil.js 1.1.1
//     Simple Javascript Library
//     By gongshunkai
//     Please contact to 49078111@qq.com if you hava any question

(function(root, factory) {

	if (typeof define === 'function' && define.amd){
		define(['exports'], function(exports){
			root.jutil = factory(root, exports);
		});
	}else{
		root.jutil = factory(root, {});
	}
	
}(this, function(root, jutil){
		
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	var
		push             = ArrayProto.push,
		slice            = ArrayProto.slice,
		concat           = ArrayProto.concat,
		toString         = ObjProto.toString,
		hasOwnProperty   = ObjProto.hasOwnProperty;

	var idCounter = 0;

	jutil.VERSION = '1.1.1';

	var Tween = jutil.Tween = {
		//无缓动
		Linear: function(t,b,c,d){ return c*t/d + b; },
		//二次方的缓动（t^2）
		Quad: {
			easeIn: function(t,b,c,d){
				return c*(t/=d)*t + b;
			},
			easeOut: function(t,b,c,d){
				return -c *(t/=d)*(t-2) + b;
			},
			easeInOut: function(t,b,c,d){
				if ((t/=d/2) < 1) return c/2*t*t + b;
				return -c/2 * ((--t)*(t-2) - 1) + b;
			}
		},
		//三次方的缓动（t^3）
		Cubic: {
			easeIn: function(t,b,c,d){
				return c*(t/=d)*t*t + b;
			},
			easeOut: function(t,b,c,d){
				return c*((t=t/d-1)*t*t + 1) + b;
			},
			easeInOut: function(t,b,c,d){
				if ((t/=d/2) < 1) return c/2*t*t*t + b;
				return c/2*((t-=2)*t*t + 2) + b;
			}
		},
		//四次方的缓动（t^4）
		Quart: {
			easeIn: function(t,b,c,d){
				return c*(t/=d)*t*t*t + b;
			},
			easeOut: function(t,b,c,d){
				return -c * ((t=t/d-1)*t*t*t - 1) + b;
			},
			easeInOut: function(t,b,c,d){
				if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
				return -c/2 * ((t-=2)*t*t*t - 2) + b;
			}
		},
		//五次方的缓动（t^5）
		Quint: {
			easeIn: function(t,b,c,d){
				return c*(t/=d)*t*t*t*t + b;
			},
			easeOut: function(t,b,c,d){
				return c*((t=t/d-1)*t*t*t*t + 1) + b;
			},
			easeInOut: function(t,b,c,d){
				if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
				return c/2*((t-=2)*t*t*t*t + 2) + b;
			}
		},
		//正弦曲线的缓动（sin(t)）
		Sine: {
			easeIn: function(t,b,c,d){
				return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
			},
			easeOut: function(t,b,c,d){
				return c * Math.sin(t/d * (Math.PI/2)) + b;
			},
			easeInOut: function(t,b,c,d){
				return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
			}
		},
		//指数曲线的缓动（2^t）
		Expo: {
			easeIn: function(t,b,c,d){
				return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
			},
			easeOut: function(t,b,c,d){
				return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
			},
			easeInOut: function(t,b,c,d){
				if (t==0) return b;
				if (t==d) return b+c;
				if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
				return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
			}
		},
		//圆形曲线的缓动（sqrt(1-t^2)）
		Circ: {
			easeIn: function(t,b,c,d){
				return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
			},
			easeOut: function(t,b,c,d){
				return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
			},
			easeInOut: function(t,b,c,d){
				if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
				return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
			}
		},
		//指数衰减的正弦曲线缓动
		Elastic: {
			easeIn: function(t,b,c,d,a,p){
				if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
				if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			},
			easeOut: function(t,b,c,d,a,p){
				if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
				if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
			},
			easeInOut: function(t,b,c,d,a,p){
				if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
				if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
				return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
			}
		},
		//超过范围的三次方缓动（(s+1)*t^3 - s*t^2）
		Back: {
			easeIn: function(t,b,c,d,s){
				if (s == undefined) s = 1.70158;
				return c*(t/=d)*t*((s+1)*t - s) + b;
			},
			easeOut: function(t,b,c,d,s){
				if (s == undefined) s = 1.70158;
				return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			},
			easeInOut: function(t,b,c,d,s){
				if (s == undefined) s = 1.70158; 
				if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
			}
		},
		//指数衰减的反弹缓动
		Bounce: {
			easeIn: function(t,b,c,d){
				return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
			},
			easeOut: function(t,b,c,d){
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
				} else {
					return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
				}
			},
			easeInOut: function(t,b,c,d){
				if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
				else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
			}
		}
	};
		

	var extend = jutil.extend = function(obj) {
		for(var i=0,source;source=slice.call(arguments, 1)[i++];){
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		}
		return obj;
	};
	
	
	var initializing = false,
		fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	var Class = jutil.Class = function(){};
	
	
	extend(Class, {
		// Create a new Class that inherits from this class
		extend:function(prop) {
			var _super = this.prototype;
	
			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			var prototype = new this();
			initializing = false;
	
			// Copy the properties over onto the new prototype
			for (var name in prop) {
				// Check if we're overwriting an existing function
				prototype[name] = typeof prop[name] == "function" &&
				typeof _super[name] == "function" && fnTest.test(prop[name]) ?
					(function(name, fn){
						return function() {
							var tmp = this._super;
	
							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];
	
							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;
	
							return ret;
						};
					})(name, prop[name]) :
					prop[name];
			}
	
			
			function Class() {
				// All construction is actually done in the init method
				if (!initializing && this.init )
				{
					this.init.apply(this, arguments);
				}
			}
			
			Class.newInstance = function(paramArr)
			{
				initializing = true;
				var obj = new Class();
				initializing = false;
				obj.init.apply(obj,paramArr);
				return obj;
			}
			// Populate our constructed prototype object
			Class.prototype = prototype;
	
			// Enforce the constructor to be what we expect
			Class.prototype.constructor = Class;
	
			// And make this class extendable
			Class.extend = arguments.callee;
			return Class;
		},
		create:function() {
			return function() { this.initialize.apply(this, arguments); }
		}
	});
	
	extend(jutil, {
		isIE:(document.all) ? true : false,
		currentStyle:function(element){
			return element.currentStyle || document.defaultView.getComputedStyle(element, null);
		},
		eventCompat:function(e) {
			e || (e = root.event);
			var type = e.type;
			if (type == 'DOMMouseScroll' || type == 'mousewheel') {
				e.delta = (e.wheelDelta) ? -e.wheelDelta / 120 : (e.detail || 0) / 3;
			}
			//alert(e.delta);
			if (e.srcElement && !e.target) {
				e.target = e.srcElement;    
			}
			if (!e.preventDefault) {
				e.preventDefault = function() {
					e.returnValue = false;
				};
			}
			if (!e.stopPropagation && e.cancelBubble !== undefined) {
				e.stopPropagation = function() {
					e.cancelBubble = true;
				};
			}
			/* 
			   ......其他一些兼容性处理 */
			return e;
		},
		addEvent:function(el,type,fn,capture) {
			if (root.addEventListener) {	
				if (type === "mousewheel" && document.mozHidden !== undefined) {
					type = "DOMMouseScroll";
				}	
				el.addEventListener(type, fn, capture || false);
			} else if (root.attachEvent) {
				el.attachEvent("on" + type, fn);
			}
		},
		removeEvent:function(el,type,fn,capture) {
			if (root.removeEventListener) {	
				if (type === "mousewheel" && document.mozHidden !== undefined) {
					type = "DOMMouseScroll";
				}	
				el.removeEventListener(type, fn, capture || false);
			} else if (root.detachEvent) {
				el.detachEvent("on" + type, fn);
			}
		},
		getOption:function(val, txt) {
			var op = document.createElement("OPTION");
			op.value = val; op.innerHTML = txt;
			return op;
		},
		bind:function(object, fun) {
			return function() {
				return fun.apply(object, arguments);
			}
		},
		bindAsEventListener:function(object, fun) {
			var self = this;
			return function(e) {
				return fun.call(object, self.eventCompat(e));
			}
		},
		each:function(obj,callback){
			var value,
				i = 0,
				length = obj.length,
				isObject = this.type.isObject(obj);
				
			if(isObject){
				for(i in obj){
					value = callback.call(obj[i],obj[i],i);     
					if(value === false){
						break;
					}
				}
			}else{
				for(;i<length;i++){
					value = callback.call(obj[i],obj[i],i);
					if(value === false){
						break;
					}
				}
			}
		},
		reverseEach:function(ary,callback){
			for(var l=ary.length-1;l>=0;l--){
				if(callback.call(ary[l],l,ary[l]) === false){
					break;
				}
			}
		},
		type:(function(){
			var type = {};
			for(var i=0,t;t=['String','Array','Number','Object','Boolean'][i++];){
				(function(t){
					type['is' + t] = function(obj){
						return Object.prototype.toString.call(obj) === '[object ' + t + ']';
					}
				})(t)
			};
			return type;
		})(),
		cookie : function (key, value, options) {
            var days, time, result, decode;

            // A key and value were given. Set cookie.
            if (arguments.length > 1 && String(value) !== "[object Object]") {
                // Enforce object
                options = extend({}, options);

                if (value === null || value === undefined){ options.expires = -1; }

                if (typeof options.expires === 'number') {
                    days = (options.expires * 24 * 60 * 60 * 1000);
                    time = options.expires = new Date();

                    time.setTime(time.getTime() + days);
                }

                value = String(value);

                return (document.cookie = [
                    encodeURIComponent(key), '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '',
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }

            // Key and possibly options given, get cookie
            options = value || {};

            decode = options.raw ? function (s) { return s } : decodeURIComponent;

            return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
        },
		//策略模式的表单验证
		validator:function(){
			this.cache = [];   //保存校验规则
			
			var strategies = {
				isNonEmpty:function(value,errorMsg){   //不为空
					if(value == ''){
						return errorMsg;
					}
				},
				minlength:function(value,length,errorMsg){   //限制最小长度
					if(value.length < length){
						return errorMsg;
					}
				},
				isMobile:function(value,errorMsg){
					if(!/(^1[3|5|8][0-9]{9}$)/.test(value)){
						return errorMsg;
					}
				}
			};
			
			return{
				add:function(dom,rules){
					var self = this;
					for(var i=0,rule;rule=rules[i++];){
						(function(rule){
							var strategyAry = rule.strategy.split(':');
							var errorMsg = rule.errorMsg;
				
							self.cache.push(function(){
								var strategy = strategyAry.shift();
								strategyAry.unshift(dom.value);
								strategyAry.push(errorMsg);
								return strategies[strategy].apply(dom,strategyAry);
							});
						})(rule)
					}
				},
				start:function(dom,rules){
					for(var i=0,validatorFunc; validatorFunc = this.cache[i++];){
						var errorMsg = validatorFunc();   //开始校验，并取得校验后的返回信息
						if(errorMsg){   //如果有确切的返回值，说明校验没有通过
							return errorMsg;
						}
					}
				}
			}
		},
		ajax:function(options){
			options = extend({}, options);
			var type = options.type || "get", //发送请求有两种方式get 跟 pos
				url = options.url || "ajax.ashx",  //创建url
				data = options.data || "",  //发送数据
				success = options.success || function(result){};  //回应数据时执行
		
			var getActiveXObject = function(){
				try{
					return new ActiveXObject("Msxml2.XMLHTTP");
				}catch(e){
					try{
						return new ActiveXObject("Microsoft.XMLHTTP");
					}catch(e){
						return false;	
					}
				}
			};
		 
			var getXMLHttpRequest = function(){
				var ajax = new XMLHttpRequest();
				if (ajax.overrideMimeType){ //设置MiME类别
					ajax.overrideMimeType("text/xml");
				}
				return ajax;
			};
		  
			var xmlHtpRq = this.iteratorObj(getActiveXObject,getXMLHttpRequest);
			if (!xmlHtpRq){ // 异常，创建对象实例失败
				alert("不能创建XMLHttpRequest对象实例.");
				return false;
			}
			xmlHtpRq.onreadystatechange = function(){
				if (xmlHtpRq.readyState == 4) { //正常响应状态
					if (xmlHtpRq.status == 200) { //正确的接收响应数据
						success(xmlHtpRq.responseText);
					}else{   //状态不正常
						alert(xmlHtpRq.status); //输出状态代码
					}
				}
			};
			if(type == "get"){
				xmlHtpRq.open('GET', url, true);
				xmlHtpRq.send(null);
			}else if(type == "post"){
				xmlHtpRq.open('POST', url, true);
				xmlHtpRq.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				xmlHtpRq.send(data);
			}	
		},
		scrollTo:function(options){
			var target = 0,//目标值
				t=0,//时间
				b=0,//起始值
				c=0;//变化量
			
			var timer = null,
				self = this;
			
			var params = {runTime:10,vertical:true,ease:true,easeStep:30,tween:Tween.Quart.easeOut,callback:function(){}};
			options = extend(params, options || {});
			
			var runTime = Math.max(1, options.runTime),	//自动滑移的延时时间,越大越慢
				vertical = !!options.vertical,			//是否垂直方向
				ease = !!options.ease,					//是否缓动
				easeStep = Math.max(1, options.easeStep),//缓动等级,越大越慢
				tween = options.tween,					//tween算子
				callback = options.callback;			//回调函数
		
			var anim = {
				init:function(value){		
					target = parseFloat(value);
					t = 0;
					b = vertical ? self.getPageScroll().y : self.getPageScroll().x;
					c = target - b;
					this.easePos();	
				},
				moveTo:function(pos){
					if(vertical){
						root.scrollTo(0,pos);
					}else{
						root.scrollTo(pos,0);
					}
				},
				easePos:function(){
					clearTimeout(timer);
					//未到达目标继续移动否则进行下一次滑动
					if (ease && c && t < easeStep) {
						this.moveTo(Math.round(tween(t++, b, c, easeStep)));
						timer = setTimeout(self.bind(this,this.easePos),runTime);
					}else{
						this.moveTo(target);
						callback();
					}	
				}
			};	
			return{
				play:function(){
					anim.init.apply(anim,arguments);
				}
			}
		},
		animation:function(obj,options){
			var params = {runTime:10,ease:true,easeStep:30,tween:Tween.Quart.easeOut};
			options = extend(params, options || {});

			var runTime = Math.max(1, options.runTime),	//自动滑移的延时时间,越大越慢
				ease = !!options.ease,					//是否缓动
				easeStep = Math.max(1, options.easeStep),//缓动等级,越大越慢
				tween = options.tween;					//tween算子
		
			/*var target = [],//目标值
				t=[],//时间
				b=[],//起始值
				c=[];//变化量*/
				
			var self = this;

			var anim = {
				timer:null,
				cache:null,
				callback:null,
				init:function(css,fun){				
					this.cache = [];
					
					if(typeof fun === 'function'){
						this.callback = fun;
					}else{
						this.callback = function(){};	
					}
				
					for(var n in css){
						var target = parseFloat(css[n]) || 0;
						var b =  parseFloat(self.currentStyle(obj)[n]) || obj["offset" + n.substring(0,1).toUpperCase() + n.substring(1)] || 0;		
						target = n == 'opacity' ? target * 100 : target;
						b = n == 'opacity' ? b * 100 : b;
						
						this.cache.push({
							css:n,target:target,t:0,b:b,c:target - b
						});
					}	
					this.easePos();	
				},
				moveTo:function(pos,n){
					if(n == 'opacity'){
						obj.style[n] = pos * 0.01;
					}else{
						obj.style[n] = pos + (n == 'zIndex' ? "" : "px");
					}
				},
				easePos:function(){
					clearTimeout(this.timer);
					for(var i=0;i<this.cache.length;i++){
						var o = this.cache[i];
						if (ease && o.c && o.t < easeStep) {
							this.moveTo(Math.round(tween(o.t++, o.b, o.c, easeStep)),o.css);
						}else{
							this.moveTo(o.target,o.css);
							this.cache.splice(i,1);
							i--;
						}
					}
					if(this.cache.length > 0){
						this.timer = setTimeout(self.bind(this,this.easePos),runTime);
					}else{
						this.callback();
					}
				}
			};	
			return{
				play:function(){
					anim.init.apply(anim,arguments);
				}
			}
		},
		drag:function(drag,options){
			//设置默认属性
			var params = {handle:null,limit:false,mxLeft:0,mxRight:9999,mxTop:0,mxBottom:9999,mxContainer:null,lockX:false,lockY:false,lock:false,dlgEvent:{"onStart":null,"onMove":null,"onStop":null}};
			options = extend(params, options || {});

			var handle = options.handle || drag,		//设置触发对象（不设置则使用拖放对象）
				limit = !!options.limit,				//是否设置范围限制(为true时下面参数有用,可以是负数)
				mxLeft = parseInt(options.mxLeft),		//左边限制
				mxRight = parseInt(options.mxRight),	//右边限制
				mxTop = parseInt(options.mxTop),		//上边限制
				mxBottom = parseInt(options.mxBottom),	//下边限制
				mxContainer = options.mxContainer || null,//指定限制在容器内
				lockX = !!options.lockX,				//是否锁定水平方向拖放
				lockY = !!options.lockY,				//是否锁定垂直方向拖放
				lock = !!options.lock,					//是否锁定
				dlgEvent = options.dlgEvent;			//事件代理
				
			var x = 0,
				y = 0,
				marginLeft = 0,
				marginTop = 0,
				self = this;
		
			handle.onmousedown = this.bindAsEventListener.call(this, handle, function(e){ start(e); });
				
			var start = function(e){
				if(lock){ return; }
				repair();
				//记录鼠标相对拖放对象的位置
				x = e.clientX - drag.offsetLeft;
				y = e.clientY - drag.offsetTop;
				//记录margin
				marginLeft = parseInt(self.currentStyle(drag).marginLeft) || 0;
				marginTop = parseInt(self.currentStyle(drag).marginTop) || 0;
				//mousemove时移动 mouseup时停止
				document.onmousemove = self.bindAsEventListener.call(self, document, function(e){ move(e); });	
				document.onmouseup = self.bindAsEventListener.call(self, document, function(e){ stop(e); });	
				//附加程序
				dlgEvent.onStart && dlgEvent.onStart(e);
			};
			//修正范围
			var repair = function() {
				if(limit){
					//修正错误范围参数
					mxRight = Math.max(mxRight, mxLeft + drag.offsetWidth);
					mxBottom = Math.max(mxBottom, mxTop + drag.offsetHeight);
					//如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
					!mxContainer || self.currentStyle(mxContainer).position == "relative" || self.currentStyle(mxContainer).position == "absolute" || (mxContainer.style.position = "relative");
				}
			};
			var move = function(e){
				//判断是否锁定
				if(lock){ stop(); return; };
				//设置移动参数
				var iLeft = e.clientX - x,
					iTop = e.clientY - y;
				//设置范围限制
				if(limit){
					//如果设置了容器，再修正范围参数
					if(!!mxContainer){
						mxLeft = Math.max(mxLeft, 0);
						mxTop = Math.max(mxTop, 0);
						mxRight = Math.min(mxRight, mxContainer.clientWidth);
						mxBottom = Math.min(mxBottom, mxContainer.clientHeight);
					}
					//修正移动参数
					iLeft = Math.max(Math.min(iLeft, mxRight - drag.offsetWidth), mxLeft);
					iTop = Math.max(Math.min(iTop, mxBottom - drag.offsetHeight), mxTop);
				}
				//设置位置，并修正margin
				if(!lockX){ drag.style.left = iLeft - marginLeft + "px"; }
				if(!lockY){ drag.style.top = iTop - marginTop + "px"; }
				//附加程序
				dlgEvent.onMove && dlgEvent.onMove(e);
			};
			var stop = function(e){
				document.onmousemove = null;
				//附加程序
				dlgEvent.onStop && dlgEvent.onStop(e);
			};
			var setDelegatedEvent = function(eName,fn){
				dlgEvent[eName] = fn;
			};
			return{
				sHandle:function(element){ handle = element || drag; },
				sLimit:function(mode){ limit = (!!mode); },
				sMXRect:function(rect){mxLeft = parseInt(rect.x); mxRight = parseInt(rect.w); mxTop = parseInt(rect.y); mxBottom = parseInt(rect.h); },
				sMXContainer:function(element){mxContainer = element || null; },
				sLockPos:function(v2){ lockX = parseInt(v2.x); lockY = parseInt(v2.y); },
				sLock:function(mode){ lock = (!!mode); },
				sDLG:function(eName,fn){ setDelegatedEvent(eName,fn); }
			};
		},
		//通用的惰性单列模式
		getSingle:function(fn){
			var result;
			return function(){
				return result || ( result = fn.apply(this,arguments));
			}
		},
		//通用迭代器模式
		iteratorObj:function(){
			for(var i=0,fn;fn=arguments[i++];){
				var obj = fn();
				if(obj !== false){
					return obj;
				}
			}
		},
		//通用对象池
		objectPoolFactory:function(createObjFn){
			var objectPool = [];
			
			return{
				create:function(){
					if(objectPool.length === 0){
						//alert('a');
						return createObjFn.apply(this,arguments);
					}else{
						return objectPool.shift();
					}
					
				},
				recover:function(obj){
					objectPool.push(obj);
				}
			}
		},
		buildTree:function(data){
			var pos={},  //保存tree的节点位置信息
				tree=[], //树对象
				i=0;  
			while(data.length!=0){  
				if(data[i].pid==0){  
					tree.push({  
						id:data[i].id,  
						text:data[i].text,
						pid:data[i].pid,
						children:[]  
					});  
					pos[data[i].id]=[tree.length-1];      
					data.splice(i,1);  
					i--;  
				}else{  
					var posArr=pos[data[i].pid];  
					if(posArr!=undefined){  
						  
						var obj=tree[posArr[0]];  
						for(var j=1;j<posArr.length;j++){  
							obj=obj.children[posArr[j]];  
						}  
		  
						obj.children.push({  
							id:data[i].id,  
							text:data[i].text,
							pid:data[i].pid,
							children:[]  
						});  
						pos[data[i].id]=posArr.concat([obj.children.length-1]);  
						data.splice(i,1);  
						i--;  
					}else{ //发生未知错误执行，避免死循环
						//data.splice(i,1);  
						//i--; 
					} 
				}  
				i++;  
				if(i>data.length-1){  
					i=0;  
				}  
			}  
			return{
				tree:tree,
				pos:pos,
				//获取当前节点的方法 
				findCurrentNode:function(id){
					var p = ("string" == typeof id || "number" == typeof id ? this.pos[id] : id) || [];
					var o = this.tree[p[0]] || {};
						
					for(var i=1; i<p.length; i++){ 
						o = o.children[p[i]];
					}
					return o || {};
				},
				//是否拥有子节点
				hasChildNodes:function(o){
					if(o.children == undefined){
						return false;
					}else{
						return o.children.length > 0;    
					}
				},
				//下一个兄弟节点
				nextSibling:function(o){
					if(o.id == undefined){
						return o;
					}else{
						var p = this.pos[o.id].concat(); //数组深拷贝
						p[p.length - 1]++;
						return this.findCurrentNode(p);
					}
				},
				//上一个兄弟节点
				previousSibling:function(o){
					if(o.id == undefined){
						return o;
					}else{
						var p = this.pos[o.id].concat(); //数组深拷贝
						p[p.length - 1]--;
						return this.findCurrentNode(p);
					}
				},
				//表示头一个子节点
				firstChild:function(o){
					if(o.children == undefined){
						return o;
					}else{
						return o.children[0];
					}
				},
				//表示最后一个子节点
				lastChild:function(o){
					if(o.children == undefined){
						return o;
					}else{
						return o.children[o.children.length - 1];
					}
				},
				//其父节点的引用
				parentNode:function(o){
					return this.findCurrentNode(o.pid);
				} 
			}
		},
		getPageSize:function() {
			var scrW, scrH;
			if(root.innerHeight && root.scrollMaxY) {
				// Mozilla
				scrW = root.innerWidth + root.scrollMaxX;
				scrH = root.innerHeight + root.scrollMaxY;
			}else if(document.body.scrollHeight > document.body.offsetHeight){
				// all but IE Mac
				scrW = document.body.scrollWidth;
				scrH = document.body.scrollHeight;
			}else if(document.body) { // IE Mac
				scrW = document.body.offsetWidth;
				scrH = document.body.offsetHeight;
			}
		
			var winW, winH;
			if(root.innerHeight) { // all except IE
				winW = root.innerWidth;
				winH = root.innerHeight;
			}else if (document.documentElement && document.documentElement.clientHeight || document.documentElement.clientWidth) {
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
		},
		getPageScroll:function() {
			var x, y;
			if(root.pageYOffset) {
				// all except IE
				y = root.pageYOffset;
				x = root.pageXOffset;
			}else if(document.documentElement && document.documentElement.scrollTop || document.documentElement.scrollLeft) {
				// IE 6 Strict
				y = document.documentElement.scrollTop;
				x = document.documentElement.scrollLeft;
			}else if(document.body) {
				// all other IE
				y = document.body.scrollTop;
				x = document.body.scrollLeft; 
			}
			return {x:x,y:y};
		},
		//获取元素在浏览器中的绝对位置
		position:function(element){
			var getTop = function(e){
				var top = e.offsetTop;
				if(e.offsetParent != null){
					top += getTop(e.offsetParent);
				}
				return top;
			};
			var getLeft = function(e){
				var left = e.offsetLeft;
				if(e.offsetParent != null){
					left += getLeft(e.offsetParent);
				}
				return left;
			};
			return {
				top:getTop(element),
				left:getLeft(element)
			}
		} 
	});
	
	//通用职责链模式
	FuncProto.chain = function(fn){
		var self = this;
		return function(){
			var ret = self.apply(this,arguments);
			if(ret === 'nextSuccessor'){
				return fn.apply(this,arguments);
			}
			return ret;
		}
	};

	//通用装饰者模式(新函数在原函数之前执行)
	FuncProto.before = function(beforefn){
		var self = this;   //保存原函数的引用    
		return function(){     //返回包含了原函数和新函数的“代理”函数
			if(beforefn.apply(this,arguments) === false){    //执行新函数，且保证this不被劫持，新函数接受的参数
															  //也会被原封不动地传入原函数，新函数在原函数之前执行
				return;		//beforefn返回false的情况直接return，不再执行后面的原函数
			}
			return self.apply(this,arguments);   //执行原函数并返回原函数的执行结果，并且保证this不被劫持
		}
	};
	//通用装饰者模式(新函数在原函数之后执行)
	FuncProto.after = function(afterfn){
		var self = this;
		return function(){
			var ret = self.apply(this,arguments);
			if(afterfn.apply(this,arguments) === false){
				return;
			}
			return ret;
		}
	};
	
	//用bind改变this指向
	FuncProto.bind = FuncProto.bind || function(context) {
	  var self = this; //保存原函数
	  return function() { //返回一个新的函数
		return self.apply(context, arguments); //执行新的函数的时候，会把之前传入的context当作新的函数体内的this
	  }
	};
	

	return jutil;

}));