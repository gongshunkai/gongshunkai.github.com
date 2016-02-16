/*
 * Shooter类
 */
//从引擎的Sprite继承
var Shooter = xengine.Sprite.extend({
	init:function(options){
		var params = {bSpeed:0,tags:[]};
		options = xengine.fn.extend(params, options || {});
		
		this._super(options);

		//子弹速度
		this.bSpeed = options.bSpeed;
		//绑定的射击点
		this.tags = options.tags;
		this.tagCurCount = new Array(this.tags.length);
		//分组groupID = 1表示敌人 0:表示玩家
		this.groupID = 1;
		//敌方目标组号
		this.targetID = 0;
		this.sCtx = new xengine.StateContext(this);
		this.addState();
		this.sCtx.change("free");
		var hw = (options.bBox&&options.bBox[0])||this.w*0.5,
			hh = (options.bBox&&options.bBox[1])||this.h*0.5;
		this.bBox = new xengine.ABBox(this.x,this.y,hw,hh);
		//是否进行碰撞检测
		this.isCalcCollide = true;
		this.zIdx = 10;
	},
	//注册状态类
	addState:function(){
		this.sCtx.add(new FreeState("free",this.sCtx));
		this.sCtx.add(new DieState("die",this.sCtx));
	},
	//创建子弹
	createBullet:function(tagIdx){
		//根据game配置创建子弹
		var tags = (tagIdx==null)?this.tags:this.tags[tagIdx];
		for(var i = 0;i<tags.length;i++){
			var tag = tags[i],
				param = {"os":this,"attack":1,"targetID":this.targetID,"x":this.x+tag[0],"y":this.y+tag[1],"dx":0,"dy":this.dy+this.bSpeed,"color":this.color};
			this.tagCurCount[i] = this.tagCurCount[i]||0;
			//如果可以发射
			if(this.tagCurCount[i]++==tag[4]){
				this.tagCurCount[i]=0;
				//调用场景类创建子弹的方法
				this.owner.cbFn[tag[3]].call(this.owner,param);
			}
		}
	},
	//重写update
	update:function(){
		//更新包围盒坐标
		this.bBox.x = this.x;
		this.bBox.y = this.y;
		this.sCtx.update();
		//超出屏幕下端则删除
		if(this.y>0){
			//this.offScreenRemove();
		}
	},
	//被子弹击中会触发事件
	onCollide:function(bullet){
		this.hp -= bullet.attack;
		if(this.hp<=0){
			this.sCtx.change("die");
		}
	}
});

//定义状态类,由子类实现
FreeState = xengine.State.extend({
});
//定义死亡状态类
DieState = xengine.State.extend({
});