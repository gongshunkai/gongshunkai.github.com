/*!
 * xengine.fsm plugin
 * By xiangfeng
 * Please contact to xiangfenglf@163.com if you hava any question
 * xengine 游戏状态机类
 */
(function(root,xengine){
	xengine.$.extend(xengine, {
		//状态抽象类
		State:xengine.Class.extend({
			init:function(type,context){
				this.ctx = context;
				this.type = type;
			},
			//调用context change方法转换到其他状态
			change:function(){
				return;
			},
			//当前状态的活动
			update:function(){
				return;
			},
			//进入该状态时执行
			enter:function(){
				return true;
			},
			//退出状态执行
			exit:function(){
				return;
			}
		}),
		//状态管理类
		StateContext:xengine.Class.extend({
			init:function(owner){
				//和该状态类关联的对象
				this.owner = owner;
				this.states={};
				this.currState = null;
			},
			change:function(type){
				this.currState&&this.currState.exit();
				this.currState = this.states[type];
				this.currState.enter();
			},
			get:function(type){
				return this.states[type];
			},
			//注册一个状态类
			add:function(state){
				this.states[state.type] = state;
				return this;
			},
			//注销一个状态类
			remove:function(type){
				if(this.states[type]!=null&&this.currState!=this.states[type]){
					delete this.states[type];
				}
			},
			clear:function(){
				this.currState = null;
				this.states = {};
			},
			//该方法在游戏主循环中使用
			update:function(){
				this.currState.change();
				this.currState.update();
			}

		})
	});
})(this,xengine);
