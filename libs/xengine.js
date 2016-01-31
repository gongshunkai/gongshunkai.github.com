//     xengine.js 1.1.2
//     Demo Javascript Game Engine
//     By xiangfeng
//     Please contact to xiangfenglf@163.com if you hava any question

(function(root, factory) {


	root.xengine = factory(root, {});


}(this, function(root, xengine) {


	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	var
		push             = ArrayProto.push,
		slice            = ArrayProto.slice,
		concat           = ArrayProto.concat,
		toString         = ObjProto.toString,
		hasOwnProperty   = ObjProto.hasOwnProperty;

	var idCounter = 0;

	xengine.VERSION = '1.1.2';



	xengine.fn = {
		extend:function(obj) {
			for(var i=0,source;source=slice.call(arguments, 1)[i++];){
				if (source) {
					for (var prop in source) {
						obj[prop] = source[prop];
					}
				}
			}
			return obj;
		},
		has:function(obj, key) {
			return hasOwnProperty.call(obj, key);
		},
		uniqueId:function(prefix){
			var id = ++idCounter + '';
			return prefix ? prefix + id : id;
		}
	};


	var initializing = false,
		fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	var Class = xengine.Class = function(){};



	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
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
	};



	var GetPageSize = function(){
		var scrW, scrH;
		if(root.innerHeight && root.scrollMaxY){
			// Mozilla
			scrW = root.innerWidth + root.scrollMaxX;
			scrH = root.innerHeight + root.scrollMaxY;
		}else if(document.body.scrollHeight > document.body.offsetHeight){
			// all but IE Mac
			scrW = document.body.scrollWidth;
			scrH = document.body.scrollHeight;
		}else if(document.body){ // IE Mac
			scrW = document.body.offsetWidth;
			scrH = document.body.offsetHeight;
		}
	
		var winW, winH;
		if(root.innerHeight){ // all except IE
			winW = root.innerWidth;
			winH = root.innerHeight;
		}else if(document.documentElement && document.documentElement.clientHeight){
			// IE 6 Strict Mode
			winW = document.documentElement.clientWidth; 
			winH = document.documentElement.clientHeight;
		}else if(document.body){ // other
			winW = document.body.clientWidth;
			winH = document.body.clientHeight;
		}
	
		// for small pages with total size less then the viewport
		var pageW = (scrW<winW) ? winW : scrW;
		var pageH = (scrH<winH) ? winH : scrH;
	
		return{PageW:pageW, PageH:pageH, WinW:winW, WinH:winH};
	};


	// xengine.FrameState
	// -------------

	var FrameState = xengine.FrameState = {
		maxFrame:0,
		minFrame:9999,
		curFrame:0,
		curTime:0,
		elapseTime:0,
		startTime:0,
		startFrame:0,
		start:function(){
			this.curTime = this.startTime = new Date();
		},
		update:function(){
			var nowTime = new Date();
			if(nowTime - this.startTime >= 1000){
				//当前帧数
				this.curFrame = this.startFrame;
				//计算最大帧数
				this.maxFrame = Math.max(this.curFrame, this.maxFrame);
				//计算最小帧数
				this.minFrame = Math.min(this.curFrame, this.minFrame);
				this.startFrame = 0;
				this.startTime = nowTime;
			}else{
				++this.startFrame;
			}
			this.elapseTime = nowTime - this.curTime;
			this.curTime = nowTime;
		}
	};

	
	//鼠标类
	var Mouse = xengine.Mouse = (function(){
		var _M = {
			x:0,
			y:0,  
			ox:0,
			oy:0,
			w:0,//鼠标中键滚动次数
			bs:[0,0,0],//鼠标状态,
			target:null,
			isMoveCacheEnable:false,//是否启用记录移动点缓存
			cache:[],//记录鼠标移动点缓存
			dlgEvent:{"up":null,"down":null,"click":null,"dbclick":null,"move":null,"wheel":null}//代理事件处理
		};   
		//默认记录30个点的缓存
		var _MAX_POINT_CACHE = 60;
		var eWeelDelta = 120;
		//设置目标
		var setTarget = function(e){
			_M.target = e.target;
		}
		//设置鼠标位置
		var setMPos = function(e){
			_M.x = e.pageX;
			_M.y = e.pageY;
		}
		//设置鼠标按键状态
		var setMBtnState = function(e,flag){
			_M.bs[e.button] = flag;
		}
		//添加点到Cache中
		var addToMPCache = function(x,y){
			if(_M.cache.length > _MAX_POINT_CACHE){
				_M.cache.shift();
				_M.cache.shift();
			}
			_M.cache.push(x);
			_M.cache.push(y);
		}
		//获取缓冲区中最前的坐标，缓冲模式下用
		var get = function(){ 
			var x = _M.cache.shift(),
		 		y = _M.cache.shift();
			return [x,y];
		}
		//清除所有缓存
		var clearCache = function(){
			_M.cache=[];
		}
		//设置事件代理
		var setDelegatedEvent = function(eName,fn){
			_M.dlgEvent[eName] = fn;
		}
		//删除事件代理
		var delDelegatedEvent = function(eName){
			_M.dlgEvent[eName] = null;
		}
		//设置是否可用
		var setEnabled = function(flag){
			if(flag){
				document.oncontextmenu = function(){return false}; 
				document.onmousemove = doMove;
				document.onmousedown = doDown;
				document.onmouseup = doUp;
				document.onclick = doClick;
				document.ondblick = doDBClick;
				document.onmousewheel = doWheel;
			}else{
				document.onmousemove = null;
				document.onmousedown = null;
				document.onmouseup = null;
				document.onclick = null;
				document.ondblick = null;
				document.onmousewheel = null;
			} 	 		 
		}
		var doMove = function(e){
			e.preventDefault();
			setMPos(e);
			setTarget(e);
			if(_M.isMoveCacheEnable){
				addToMPCache(_M.x,_M.y);
			}
			_M.dlgEvent.move && _M.dlgEvent.move(e);
		}
		var doDown = function(e){
			//e.preventDefault();
			setMBtnState(e,1);
			setTarget(e);
			_M.ox = e.pageX;
			_M.oy = e.pageY;
			_M.dlgEvent.down && _M.dlgEvent.down(e);
		}
		var doUp = function(e){
			setMBtnState(e,0);
			setTarget(e);
			_M.dlgEvent.up && _M.dlgEvent.up(e);
		}
		var doClick = function(e){	   
			_M.dlgEvent.click && _M.dlgEvent.click(e);
		}
		var doDBClick = function(e){
			_M.dlgEvent.dbclick && _M.dlgEvent.dbclick(e);  
		}
		var doWheel = function(e){
			_M.w += (e.wheelDelta >= eWeelDelta) ? 1 : -1;
			_M.dlgEvent.doWheel && _M.dlgEvent.doWheel(e);  
		}
		//初始化
		setEnabled(true);
		return {
			gTarget:function(){return _M.target;},
			gPos:function(v3){v3.x = _M.x;v3.y = _M.y;v3.z = _M.w},
			gX:function(){return _M.x},
			gY:function(){return _M.y},
			gW:function(){return _M.w},
			gBtnState:function(btn){return _M.bs[btn]; },
			gXOff:function(){return _M.x-_M.ox},
			gYOff:function(){return _M.y-_M.oy},
			gCPT:function(){ return get();},
			cCHE:function(){ clearCache();},
			sDLG:function(eName,fn){setDelegatedEvent(eName,fn);},
			dDLG:function(eName){delDelegatedEvent(eName);},
			sMode:function(mode){_M.isMoveCacheEnable = (mode===1);}//0:立即模式，1:缓冲模式
		};
	})();
	
	//触摸类
	var Touch = xengine.Touch = (function(){
		var _T = {
			x:0,
			y:0,  
			ox:0,
			oy:0,
			ts:0,//触摸状态,
			target:null,
			isTouchCacheEnable:false,//是否启用记录移动点缓存
			cache:[],//记录触摸移动点缓存
			dlgEvent:{"start":null,"move":null,"end":null}//代理事件处理
		};   
		//默认记录30个点的缓存
		var _MAX_POINT_CACHE = 60;
		//设置目标
		var setTarget = function(e){
			_T.target = e.target;
		}
		//设置触摸位置
		var setPos = function(e){
			_T.x = e.pageX;
			_T.y = e.pageY;
		}
		//设置触摸状态
		var setTouchState = function(flag){
			_T.ts = flag;
		}
		//添加点到Cache中
		var addToMPCache = function(x,y){
			if(_T.cache.length > _MAX_POINT_CACHE){
				_T.cache.shift();
				_T.cache.shift();
			}
			_T.cache.push(x);
			_T.cache.push(y);
		}
		//获取缓冲区中最前的坐标，缓冲模式下用
		var get = function(){ 
			var x = _T.cache.shift(),
		 		y = _T.cache.shift();
			return [x,y];
		}
		//清除所有缓存
		var clearCache = function(){
			_T.cache=[];
		}
		//设置事件代理
		var setDelegatedEvent = function(eName,fn){
			_T.dlgEvent[eName] = fn;
		}
		//删除事件代理
		var delDelegatedEvent = function(eName){
			_T.dlgEvent[eName] = null;
		}
		//设置是否可用
		var setEnabled = function(flag){
			if(flag){
				document.ontouchstart = doStart;
				document.ontouchmove = doMove;
				document.ontouchend = doEnd;
			}else{
				document.ontouchstart = null;
				document.ontouchmove = null;
				document.ontouchend = null;
			} 	 		 
		}
		var doStart = function(e){
			setTouchState(1);
			setTarget(e);
			var touch = e.touches[0]; //获取第一个触点
			_T.ox = touch.pageX;
			_T.oy = touch.pageY;
			_T.dlgEvent.start && _T.dlgEvent.start(e);
		}
		var doMove = function(e){
			setPos(e.touches[0]);
			setTarget(e);
			if(_T.isTouchCacheEnable){
				addToMPCache(_T.x,_T.y);
			}
			_T.dlgEvent.move && _T.dlgEvent.move(e);
		}
		var doEnd = function(e){
			setTouchState(0);
			setTarget(e);
			_T.dlgEvent.end && _T.dlgEvent.end(e);
		}
		//初始化
		setEnabled(true);
		return {
			gTarget:function(){return _T.target;},
			gPos:function(v3){v3.x = _T.x;v3.y = _T.y;},
			gX:function(){return _T.x},
			gY:function(){return _T.y},
			gState:function(){return _T.ts; },
			gXOff:function(){return _T.x-_T.ox},
			gYOff:function(){return _T.y-_T.oy},
			gCPT:function(){ return get();},
			cCHE:function(){ clearCache();},
			sDLG:function(eName,fn){setDelegatedEvent(eName,fn);},
			dDLG:function(eName){delDelegatedEvent(eName);},
			sMode:function(mode){_T.isTouchCacheEnable = (mode===1);}//0:立即模式，1:缓冲模式
		};
	})();
   
	//键盘类
	var Key = xengine.Key = (function(){
		var _K = {  
			A:65,
			B:66,
			C:67,
			D:68,
			E:69,
			F:70,
			G:71,
			H:72,
			I:73,
			J:74,
			K:75,
			L:76,
			M:77,
			N:78,
			O:79,
			P:80,
			Q:81,
			R:82,
			S:83,
			T:84,
			U:85,
			V:86,
			W:87,
			X:88,
			Y:89,
			Z:90,
			N0:48,
			N1:49,
			N2:50,
			N3:51,
			N4:52,
			N5:53,
			N6:54,
			N7:55,
			N8:56,
			N9:57,
			LEFT:37,
			RIGHT:39,
			UP:38,
			DOWN:40,
			ENTER:13,
			SPACE:32,
			TAB:9,
			SHIFT:16,
			ALT:18,
			CTRL:17,	  
			//记录键盘缓冲最大数
			MAX_KEY_CACHE:20,
			//记录键盘状态
			states:new Array(255),
			cache:[],
			//事件代理对象
			dlgEvent:{"up":null,"down":null},
			isEnableCache:false,
			//设置事件代理
			setDLG:function(eName,fn){
				this.dlgEvent[eName] = fn;
			},
			//删除事件代理
			delDLG:function(eName){
				this.dlgEvent[eName] = null;
			},
			//设置是否可用
			setEnabled:function(flag){
				var self = this;
				if(flag){
					var st = this.states;
					this.clearKeyStates();
					this.sMode(0);
					document.onkeydown = function(e){
						st[e.keyCode] = 1; 
						if(self.isEnableCache){
							if(self.cache.length > MAX_KEY_CACHE){
								self.cache.shift();
							}
							self.cache.push(e.keyCode);
						}
						self.dlgEvent.down && self.dlgEvent.down(e);
					};
					document.onkeyup = function(e){
						st[e.keyCode] = 0;  
						self.dlgEvent.up && self.dlgEvent.up(e);
					}		  
				}else{
					document.onkeydown = null;
					document.onkeyup = null;
				}
			},
			//判断是否按键
			pressed:function(key){
				return this.states[key];
			},
			//获取缓冲区中最前的按键
			get:function(){
				return this.cache.shift();
			},
			//按了keys数组中任何键
			pAny:function(keys){
				var result = false;
				for(var  i=0;i<keys.length;i++){
					if(this.states[keys[i]]){
					   result = true;
					   break;
					}
				}
				return result;
			},
			//按下所有键,state 1:down 0:up
			pAll:function(keys,state){
				var result = true;
				for(var  i=0;i<keys.length;i++){
					if(this.states[keys[i]]==!state){
					   result = false;
					   break;
					}
				}
				return result; 
			}, 
			clearKeyStates:function(){
				for(var i =0;i<255;i++){
					this.states[i]=0;
				}
			},
			clearCache:function(){
				this.cache = [];
			},
			sMode:function(mode){
				this.isEnableCache = (mode===1);
			}
		}
		//初始化
		_K.setEnabled(true);
		return _K;
	})();
	
	
	
	// Event
	// -------------
	
	var Events = {
		//保存所有的监听器
		listeners:[],
		//添加监听器
		addListener:function(fn){
			this.listeners.push(fn);
		},
		//清空监听器列表
		clearListener:function(){
			this.listeners.length = 0;
		}
	};
	

	// xengine.EventListener
	// -------------

	var EventListener = xengine.EventListener = Class.extend({														
		init:function(options){
			//监听器是否生效
			this.enabled = true;
			options || (options = {});
			//游戏主循环执行渲染操作前触发
			this.onBeforeRender = options["beforeRender"] || function(){
				throw new Error('必须重写onBeforeRender方法');
			},
			//游戏主循环执行渲染操作后触发
			this.onAfterRender = options["afterRender"] || function(){
				throw new Error('必须重写onAfterRender方法');
			}
		}
	});
	
	
	// Game
	// -------------

	var Game = Class.extend();
	xengine.fn.extend(Game.prototype, Events, {
		init:function(){
			this.paused = false;
			this.timer = null;
			//场景管理器
			this.sceneManager = new SceneManager();
		},
		//游戏主循环
		mainloop:function(){
			//触发监听器渲染前事件
			for(var i=0,ltns;ltns=this.listeners[i++];){
				ltns.enabled && ltns.onBeforeRender();
			}
			//获取当前场景，更新，并渲染
			var scene = this.sceneManager.getCurrentScene();
			if(scene)
			{
				scene.update();
				scene.render();
			}
			//触发监听器渲染后事件
			for(var i=0,ltns;ltns=this.listeners[i++];){
				ltns.enabled && ltns.onAfterRender();
			}
		},
		//执行游戏
		run:function(fun,fps){
			fps = fps || 60;
			var self = this,
				spf = (1000/fps) || 0;
			//开启帧数追踪
			FrameState.start();
			this.timer = setInterval(function(){
				//更新帧状态
				FrameState.update();
				!self.paused && self.mainloop();
			},spf);
			//游戏的业务逻辑
			fun && fun();
		},
		//暂停游戏
		pause:function(){
			this.paused = true;
		},
		//继续游戏
		resume:function(){
			this.paused = false;
		},
		//终止游戏
		stop:function(){
			clearInterval(this.timer);
		}
	});


	// xengine.Scene
	// -------------

	var Scene = xengine.Scene = Class.extend();
	xengine.fn.extend(Scene.prototype, Events, {
		init:function(options){
			options || (options = {});
			//场景名称
			this.name = options.name|| xengine.fn.uniqueId('scene');
			//位置信息
			this.x = options.x || 0;
			this.y = options.y || 0;
			this.w = options.w || 320;
			this.h = options.h || 200;
			this.color = options.color || "black";
			//绑定的canvas元素,以后的精灵都在这个canvas上进行绘制
			this.cvs = document.createElement('canvas');
			this.cvs.id = "cv_" + this.name;
			this.cvs.style = "z-index:-1;position:absolute;left:0px;top:0px";
			this.ctx = this.cvs.getContext("2d");
			this.setPos();
			this.setSize();
			this.setColor(this.color);
			document.body.appendChild(this.cvs);
			//记录所有的渲染对象
			this.rObjs = [];
			//命名的渲染对象，便于根据名称快速查找对象
			this.namedRObjs = {};
		},
		//添加到rObjs中
		addChild:function(renderObj){
			renderObj.owner = this;
			this.rObjs.push(renderObj);
			this.namedRObjs[renderObj.name] = renderObj;
		},
		//删除对象
		removeChild:function(renderObj){
			this.removeByName(renderObj.name);
		},
		//根据名称设置对象移除标记
		removeByName:function(name){
			this.namedRObjs[name]&&(this.namedRObjs[name].canRemove=true||true);
		},
		//移除所有置可移除标记的对象
		removeAllCanRemove:function(){
			for(var i=0;i<this.rObjs.length;i++){
				var o = this.rObjs[i];
				if(o.canRemove){
					delete this.namedRObjs[o.name];
					this.rObjs.splice(i,1);
				}
			}
		},
		//根据名称查找对象
		getByName:function(name){
			return this.namedRObjs[name];
		},
		//清除所有渲染对象
		clearAll:function(){
			this.rObjs = [];
			this.namedRObjs = {};
		},
		//更新场景
		update:function(){
			for(var i = 0;i<this.rObjs.length;i++){
				this.rObjs[i].update();
			}
			this.removeAllCanRemove();
		},
		//执行渲染
		render:function(){
			var ltns = this.listeners;
			//先清除场景，再渲染
			this.clear();
			//执行渲染前监听器
			for(var i=0,len = ltns.length;i<len;i++){
				ltns[i].enabled&&ltns[i].onBeforeRender(this);
			}
			//排序
			this.sortRObj();
			this.renderRObj();
			//执行渲染后监听器
			for(var i=0;i<len;i++){
				ltns[i].enabled&&ltns[i].onAfterRender(this);
			}
		},
		//渲染所有对象
		renderRObj:function(){
			for(var i = 0,len = this.rObjs.length;i<len;i++){
				this.ctx.save();
				this.rObjs[i].isVisible&&this.rObjs[i].render(this.ctx);
				this.ctx.restore();
			}
		},
		//按zIdx排序所有渲染对象，渲染按数字越小越先渲染
		sortRObj:function(){
			this.rObjs.sort(function(o1,o2){
				return o1.zIdx-o2.zIdx;
			});
		},
		//设置位置
		setPos:function(x,y){
			this.x = x||this.x;
			this.y = y||this.y;
			this.cvs.style.left = this.x + "px";
			this.cvs.style.top = this.y + "px";
		},
		//设置大小
		setSize:function(w,h){
			this.w = w||this.w;
			this.h = h||this.h;
			this.cvs.setAttribute("width",this.w);
			this.cvs.setAttribute("height",this.h);
		},
		//设置canvas背景
		setColor:function(color){
			this.color = color  || "black";
			this.cvs.style.backgroundColor = this.color;
		},
		resize:function(){
			var pageSize = GetPageSize();
			var dw = this.w,
				dh = this.h,
				cw = pageSize.WinW,
				ch = pageSize.WinH;
			var w = 0,h = 0;
		
			if(cw > dw){
				h = dh*(cw / dw);
			}else{
				h = dh/(dw / cw);
			}
			
			if(ch > dh){
				w = dw*(ch / dh);
			}else{
				w = dw/(dh / ch);
			}
		
			w = Math.min(w,cw);
			h = Math.min(h,ch);
		
			this.cvs.style.width = w+"px";
			this.cvs.style.height = h+"px";
			this.cvs.style.left = cw*0.5 - w*0.5 + "px";
		},
		//清除canvas背景
		clear:function(){
			this.ctx.clearRect(0,0,this.w,this.h);
		},
		//显示
		show:function(){
			this.cvs.style.display = 'block';
		},
		//隐藏
		hide:function(){
			this.cvs.style.display = 'none';
		},
		//淡出
		fadeOut:function(time,fn){
			//this.cvs.fadeOut(time,fn);
		},
		//淡入
		fadeIn:function(time,fn){
			//this.cvs.fadeIn(time,fn);
		},
		//设置背景,pattern:0(居中),1(拉伸),默认(平铺)
		setBGImg:function(imgURL,pattern){
			this.cvs.style.backgroundImage = "url(" + imgURL + ")";
			switch(pattern){
				case 0:
					this.cvs.style.backgroundRepeat = "no-repeat";
					this.cvs.style.backgroundPosition = "center";
					break;
				case 1:
					this.cvs.style.backgroundSize = this.w + "px " + this.h + "px ";
					break;
			}
		},
		//清除相关所有资源
		clean:function(){
			this.listeners = null;
			this.cvs.parentNode.removeChild(this.cvs);
			this.cvs = this.ctx = null;
		}
	});
	
	
	// SceneManager
	// -------------

	var SceneManager = Class.extend({
		init:function(){
			//以命名方式保存,便于快速通过名称获取
			this.namedScenes = {};
			//以堆栈方式保存所有场景，最后的元素为栈顶
			this.scenes = [];
		},
		//场景重排序
		sortSceneIdx:function(){
			for(var i=0,len=this.scenes.length;i<len;i++){
				var sc = this.scenes[i];
				sc.cvs.style.zIndex = i;
			}
		},
		//压入scene场景
		push:function(scene){
			if(!this.getScene(scene.name)){
				this.scenes.push(scene);
				this.namedScenes[scene.name] = scene;
				this.sortSceneIdx();
			} 
		},
		//移除顶部场景
		pop:function(){
			var sc = this.scenes.pop();
			if(sc!=null){
				sc.clean();			 
				delete this.namedScenes[sc.name]; 
				this.sortSceneIdx();
			}
		}, 
		//删除场景
		remove:function(scene){
			scene.clean();		
			delete this.namedScenes[scene.name]; 
			var idx = this.getIdx(scene);
			this.scenes.splice(idx,1);
			this.sortSceneIdx();
		},
		//交换场景位置
		swap:function(from,to){
			if(from>=0&&from<=this.scenes.length-1
			&&to>=0&&to<=this.scenes.length-1){
				var sc = this.scenes[from];
				this.scenes[from] = this.scenes[to];
				this.scenes[to] = sc;
				this.sortSceneIdx();
			}
		},
		//获取某个场景的索引
		getIdx:function(scene){		  
			return scene.cvs.css("z-index");		
		},
		//把某个场景移动到最顶部
		bringToFirst:function(scene){
			var idx = this.getIdx(scene);
			if(idx!=this.scenes.length-1){
				this.scenes.splice(idx,1);
				this.scenes[this.scenes.length] = scene;	
				this.sortSceneIdx();
			}
		},
		//把某个场景移动到最底部
		bringToLast:function(scene){
			var idx = this.getIdx(scene);
			if(idx!=0){
				this.scenes.splice(idx,1);
				this.scenes.splice(0,0,scene);
				this.sortSceneIdx();
			}
		},
		//场景后移
		back:function(scene){
			var idx = this.getIdx(scene);
			if(idx>0){
				this.swap(idx,idx-1);
			}		 
		},
		//场景前移
		forward:function(scene){
			var idx = this.getIdx(scene);
			if(idx<this.scenes.length){			 
				this.swap(idx,idx+1);
			}
		},
		//根据名称获取场景
		getScene:function(name){
			return this.namedScenes[name];
		}, 
		//获取当前场景,顶部场景为当前场景
		getCurrentScene:function(){
			return this.scenes[this.scenes.length-1];
		}, 
		//清除所有场景
		clearAll:function(){
			for(var i in this.scenes){
				this.scenes[i].clean(); 
			}
			this.namedScenes = {};
			this.scenes = [];
		}
	});


	// RenderObj
	// -------------

	var RenderObj = Class.extend({
		init:function(options){
			options || (options = {});
			this.name = options.name || xengine.fn.uniqueId('renderObj');
			//拥有者,指向场景对象
			this.owner = null;
			//x,y方向坐标
			this.x = options.x || 0;
			this.y = options.y || 0;
			//对象宽度和高度
			this.w = options.w || 0;
			this.h = options.h || 0;
			//x,y方向的速度
			this.dx = options.dx || 0;
			this.dy = options.dy || 0;
			//x,y方向的加速度
			this.vx = options.vx || 0;
			this.vy = options.vy || 0;
			//角度
			this.deg = options.deg || 0;
			//z-index,数字越小越先渲染
			this.zIdx = options.zIdx || 0;
			//是否可见
			this.isVisible = !!options.isVisible;
			//是否可移除
			this.canRemove = !!options.canRemove;
		},
		//设置位置
		moveTo:function(x,y){
			this.x = x||this.x;
			this.y = y||this.y;
		},
		//移动
		move:function(xOff,yOff){
			this.x += xOff;
			this.y += yOff;
		},
		//移动一小步
		moveStep:function(){
			this.dx += this.vx;
			this.dy += this.vy;
			this.x += this.dx;
			this.y += this.dy;
		},
		//旋转deg度
		rot:function(deg){
			this.deg = deg;
		},
		//更新方法，每一帧调用
		update:function(){
			this.moveStep();
		},
		//渲染方法，每一帧调用,ctx是canvas环境
		render:function(ctx){
			return;
		},
		//判断鼠标当前坐标是否在当前渲染对象区域中
		isMouseIn:function(){
			var x = Mouse.gX() || Touch.gX(),
				y = Mouse.gY() || Touch.gY();
			var gx = this.owner.cvs.offsetLeft,
				gy = this.owner.cvs.offsetTop,
				gw = this.owner.cvs.offsetWidth,
				gh = this.owner.cvs.offsetHeight;
			//转换鼠标坐标到游戏窗口坐标系
			
			var bw = gw > this.owner.w ? gw / this.owner.w : this.owner.w / gw,
				bh = gh > this.owner.h ? gh / this.owner.h : this.owner.h / gh;
			var cd = [x-gx,y-gy];
			var cd0 = gw > this.owner.w ? parseInt(cd[0]*bw) : parseInt(cd[0] / bw),
				cd1 = gh > this.owner.h ? parseInt(cd[1]*bh) : parseInt(cd[1] / bh);
				hw = this.w*0.5,
				hh = this.h*0.5;
			//alert(cd0);
			return cd0 >= this.x - hw && cd0 <= this.x + hw && cd1 >= this.y - hh && cd1 <= this.y + hh;
		}
	});


	// xengine.Frames
	// -------------

	var Frames = xengine.Frames = Class.extend({
		init:function(options){
			options || (options = {});
			//帧动画名称
			this.name = options.name || xengine.fn.uniqueId('frames');;
			//帧动画每帧所持续的时间
			this.duration = options.duration || 50;//默认每帧持续50毫秒
			//保存每帧位置，和持续时间信息
			this.frames = [];
			//对应的动画帧序列图,
			this.img = options.img || null;
		},
		//添加帧数据
		add:function(x,y,w,h,img,dur){
			var dur = dur || this.duration,
				img = img || this.img;
			this.frames.push([img,x,y,w,h,dur]);
		},
		//插入帧数据
		insert:function(idx,x,y,w,h,img,dur){
			var dur = dur || this.duration,
				img = img || this.img;
			this.frames.splice(idx,0,[img,x,y,w,h,dur]);
		},
		//移出帧数据
		remove:function(idx){
			this.frames.splice(idx,1);
		},
		//删除所有帧
		clear:function(){
			this.frames = [];
		},
		//获取帧数据
		get:function(idx){
			return this.frames[idx];
		},
		//获取总数
		getCount:function(){
			return this.frames.length;
		}
	});


	// xengine.Animations
	// -------------

	var Animations = xengine.Animations = Class.extend({
		init:function(){
			//保存所有动画帧
			this.anims = {};
		},
		//获取所有名称
		getAllNames:function(){
			var ans = [];
			for(var k in this.anims){
				if(this.anims.hasOwnProperty(k)){
					ans.push(k);
				}
			}
			return ans;
		},
		//添加帧动画集合
		add:function(name,frames){
			this.anims[name] = frames;
		},
		//删除帧动画集合
		remove:function(name){
			this.anims[name] = null;
		},
		//清空帧动画集合
		clear:function(){
			this.anims = {};
		},
		//获取当前帧动画
		get:function(name){
			return this.anims[name];
		}
	});


	// xengine.FrameCtrl
	// -------------

	var FrameCtrl = xengine.FrameCtrl = Class.extend({
		init:function(processFrameFN){
			//设置动画处理函数
			this.processFrame = processFrameFN || function(){
					//计算上一帧到现在的时间
					this.fDur += FrameState.elapseTime * this.speed;
					//如果超过当前帧的持续时间就切换到下一帧
					if(this.fDur >= this.currFrames.frames[this.currFIdx][5]){
						this.fDur = 0;
						if(this.currFIdx<this.feIdx-1){
							++this.currFIdx;
						}else{
							if(this.isCycle){
								this.currFIdx = this.fsIdx;
							}
						}
					}
				};
		},
		//复位所有属性
		reset:function(){
			//开始帧索引
			this.fsIdx = 0;
			//结束帧索引
			this.feIdx = this.currFrames.getCount();
			//当前运行帧索引
			this.currFIdx = 0;
			//是否循环
			this.isCycle = true;
			//当前帧已经持续的时间
			this.fDur = 0;
			//动画速度
			this.speed = 1;
		},
		//设置当前帧动画
		setCurrent:function(name){
			var cFrames  = this.anims.get(name);
			if(this.currFrames!=cFrames){
				var oSpeed = this.speed || 1;
				this.currFrames = cFrames;
				this.reset();
				this.speed = oSpeed;
			}
		},
		//获取当前帧动画
		getCurrent:function(){
			return this.currFrames;
		},
		//设置frames
		setAnims:function(animations,currAnimName){
			this.anims = animations;
			currAnimName || (currAnimName = "def");
			//设置当前动画帧集
			this.setCurrent(currAnimName);
		},
		getCurrFrameIdx:function(){
			return this.currFIdx;
		},
		//获取当前帧
		getCurrFrame:function(){
			return this.currFrames.get(this.currFIdx);
		},
		//获取下一帧
		getNextFrame:function(){
			this.processFrame();
			return this.currFrames.get(this.currFIdx);
		},
		//是否到了最后一帧
		isLastFrame:function(){
			return this.currFIdx == this.currFrames.frames.length-1;
		},
		//是否到了第一帧
		isFirstFrame:function(){
			return this.currFIdx == 0;
		}
	});


	// xengine.Sprite
	// -------------

	var Sprite = xengine.Sprite = RenderObj.extend({
		init:function(options){
			options || (options = {});
			this._super(options);
			//帧动画集合对象
			this.anims = null;
			this.animsCtrl = new FrameCtrl();
			//是否水平反向
			this.isXFlip = !!options.isXFlip;
			//是否垂直反向
			this.isYFlip = !!options.isYFlip;
			this.scaleX = options.scaleX || 0;
			this.scaleY = options.scaleY || 0;
			//包围盒
			this.bBox = null;
			//tagPoint
			this.tags = [];
		},
		//设置帧动画集合对象
		setAnims:function(animations,currAnimName){
			currAnimName || (currAnimName = "def");
			this.anims = animations;
			this.animsCtrl.setAnims(animations,currAnimName);
			//重新设置大小
			var f = this.getCurrFrame();
			this.w =  f[3];
			this.h =  f[4];
		},
		//设置动画集
		addAnim:function(name,frames,isCurrent){
			this.anims.add(name,frames);
			isCurrent && this.animsCtrl.setCurrent(name);
		},
		//删除指定名称动作
		removeAnim:function(name){
			this.anims.remove(name);
		},
		//按名称设置当前动作
		setCAnim:function(name){
			this.animsCtrl.setCurrent(name);
		},
		//设置动画速度
		setAnimSpeed:function(sp){
			this.animsCtrl.speed = sp;
		},
		//按名称获取动作
		getAnim:function(name){
			return this.anims.get(name);
		},
		//获取当前运行的动画
		getCurrentAnim:function(){
			return this.animsCtrl.getCurrent();
		},
		//获取当前运行帧
		getCurrFrame:function(){
			return this.animsCtrl.getCurrFrame();
		},
		//获取下一帧信息
		getNextFrame:function(){
			return this.animsCtrl.getNextFrame();
		},
		//超出屏幕移除该对象
		offScreenRemove:function(){
			var hw = this.w * 0.5,
				hh = this.h * 0.5;
			if(this.x < -hw || this.x > this.owner.w + hw || this.y < -hh || this.y > this.owner.h + hh){
				this.owner.removeChild(this);
			}
		},
		//更新方法
		update:function(){
			this._super();
			if(this.bBox){
				this.bBox.x = this.x;
				this.bBox.y = this.y;
			}
			this.offScreenRemove();
		},
		//渲染方法，每一帧调用,ctx是canvas环境
		render:function(ctx){
			ctx.translate(this.x,this.y);
			var hw = 0.5 * this.w,
				hh = 0.5 * this.h;
			var scaleX = this.isXFlip ? -this.scaleX : this.scaleX;
			var scaleY = this.isYFlip ? -this.scaleY : this.scaleY;
			if(this.deg !== 0){
				ctx.rotate(this.deg*Math.PI/180);
			}
			ctx.scale(scaleX,scaleY);
			var f = this.getNextFrame();
			ctx.drawImage(f[0],f[1],f[2],f[3],f[4],-hw,-hh,this.w,this.h);
		}
	});



	// Helpers
	// -------


	var game = xengine.game = new Game();
	var director = xengine.director = game.sceneManager;
	
	return xengine;

}));