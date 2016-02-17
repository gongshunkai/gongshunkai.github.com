//     jutil.js 1.1.1
//     Simple Javascript Library
//     By gongshunkai
//     Please contact to 49078111@qq.com if you hava any question

(function(root, factory) {

	// Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.jutil = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.jutil = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }
	
}(this, function(root, jutil, _, $){
		
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
		getOption:function(val, txt) {
			var op = $("<option></option>");
			op.val(val); op.html(txt);
			return op;
		},
		bind:function(object, fun) {
			return function() {
				return fun.apply(object, arguments);
			}
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
					b = vertical ? $(window).scrollTop() : $(window).scrollLeft();
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
						var b =  parseFloat(obj.css(n)) || obj[0]["offset" + n.substring(0,1).toUpperCase() + n.substring(1)] || 0;		
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
						obj.css(n,pos * 0.01);
					}else{
						obj.css(n,pos);
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
		
			handle.on('mousedown',function(e){ start(e); });
				
			var start = function(e){
				if(lock){ return; }
				repair();
				//记录鼠标相对拖放对象的位置
				x = e.clientX - drag.position().left;
				y = e.clientY - drag.position().top;
				//记录margin
				marginLeft = parseInt(drag.css('marginLeft')) || 0;
				marginTop = parseInt(drag.css('marginTop')) || 0;
				//mousemove时移动 mouseup时停止
				$(document).on('mousemove',function(e){ move(e); });	
				$(document).on('mouseup',function(){ stop(); });
				//附加程序
				dlgEvent.onStart && dlgEvent.onStart(e);
			};
			//修正范围
			var repair = function() {
				if(limit){
					//修正错误范围参数
					mxRight = Math.max(mxRight, mxLeft + drag.outerWidth());
					mxBottom = Math.max(mxBottom, mxTop + drag.outerHeight());
					//如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
					!mxContainer || mxContainer.css('position') == "relative" || mxContainer.css('position') == "absolute" || (mxContainer.css('position','relative'));
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
						mxRight = Math.min(mxRight, mxContainer.innerWidth());
						mxBottom = Math.min(mxBottom, mxContainer.innerHeight());
					}
					//修正移动参数
					iLeft = Math.max(Math.min(iLeft, mxRight - drag.outerWidth()), mxLeft);
					iTop = Math.max(Math.min(iTop, mxBottom - drag.outerHeight()), mxTop);
				}
				//设置位置，并修正margin
				if(!lockX){ drag.css('left',iLeft - marginLeft); }
				if(!lockY){ drag.css('top',iTop - marginTop); }
				//附加程序
				dlgEvent.onMove && dlgEvent.onMove(e);
			};
			var stop = function(){
				$(document).unbind('mousemove');
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