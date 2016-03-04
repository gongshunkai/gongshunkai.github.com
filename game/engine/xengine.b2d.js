/*!
 * xengine.b2d plugin
 * By xiangfeng
 * Please contact to xiangfenglf@163.com if you hava any question
 * xengine 游戏物理引擎类
 */
(function(root,xengine){
	xengine.$.extend(xengine, {
		//把box2d基本固定不变的创建过程封装到了一个对象中
		EasyB2D:{
			b2AABB:Box2D.Collision.b2AABB,
			b2CircleShape:Box2D.Collision.Shapes.b2CircleShape,
			b2PolygonShape:Box2D.Collision.Shapes.b2PolygonShape,
			b2Mat22:Box2D.Common.Math.b2Mat22,
			b2Vec2:Box2D.Common.Math.b2Vec2,
			b2Color:Box2D.Common.b2Color,
			b2Body:Box2D.Dynamics.b2Body,
			b2BodyDef:Box2D.Dynamics.b2BodyDef,
			b2DebugDraw:Box2D.Dynamics.b2DebugDraw,
			b2FixtureDef:Box2D.Dynamics.b2FixtureDef,
			b2Fixture:Box2D.Dynamics.b2Fixture,
			b2World:Box2D.Dynamics.b2World,
			b2MassData:Box2D.Collision.Shapes.b2MassData,
			b2MouseJointDef:Box2D.Dynamics.Joints.b2MouseJointDef,
			b2PrismaticJointDef:Box2D.Dynamics.Joints.b2PrismaticJointDef,
			b2LineJointDef:Box2D.Dynamics.Joints.b2LineJointDef,
			b2RevoluteJointDef:Box2D.Dynamics.Joints.b2RevoluteJointDef,
			b2DistanceJointDef:Box2D.Dynamics.Joints.b2DistanceJointDef,
			b2WeldJointDef:Box2D.Dynamics.Joints.b2WeldJointDef,
			b2PulleyJointDef:Box2D.Dynamics.Joints.b2PulleyJointDef,
			b2FrictionJointDef:Box2D.Dynamics.Joints.b2FrictionJointDef,
			b2GearJointDef:Box2D.Dynamics.Joints.b2GearJointDef,
			b2WheelJointDef:Box2D.Dynamics.Joints.b2WheelJointDef,
			b2RopeDef:Box2D.Dynamics.Joints.b2RopeJointDef,
			b2MotorJointDef:Box2D.Dynamics.Joints.b2MotorJointDef,
			b2ContactListener:Box2D.Dynamics.b2ContactListener,
			b2ContactFilter:Box2D.Dynamics.b2ContactFilter,
			b2BuoyancyController:Box2D.Dynamics.Controllers.b2BuoyancyController,
			//转换长度到box2d世界
			lenToB2d:function(pixel){
				return pixel/this.scale;
			},
			//转换box2d长度到屏幕像素
			lenToScn:function(b2Len){
				return b2Len*this.scale;
			},
			//转换鼠标坐标到box2d世界
			mouseToB2d:function(mx,my,cx,cy,cw,ch,sw,sh){		
				var bw = cw > sw ? cw / sw : 1 / (sw / cw),
					bh = ch > sh ? ch / sh : 1 / (sh / ch);
				//转换鼠标坐标到游戏窗口坐标系	
				return new this.b2Vec2((mx-cx)/bw,(my-cy)/bh);
			},
			//创建并返回一个Box2D世界
			createWorld:function(x,y){
				this.mouseJoint = null;//鼠标关节
				this.scale = 30;
				this.world = new this.b2World(new this.b2Vec2(x,y),true);
			},
			updateWorld:function(frames){
				this.world.Step(1/frames, 10, 10);
				this.world.ClearForces();
				this.world.DrawDebugData();
			},
			//设置显示窗口
			setDebugDraw:function(ctx,options){
				var params = {drawScale:30.0,fillalpha:0,alpha:0,lineThickness:1.0};
				options = xengine.$.extend(params, options || {});
				
				var drawScale = parseFloat(options.drawScale),
					fillalpha = parseFloat(options.fillalpha),
					alpha = parseFloat(options.alpha),
					lineThickness = parseFloat(options.lineThickness);
				
				var debugDraw = new this.b2DebugDraw();
				debugDraw.SetSprite(ctx);
				debugDraw.SetDrawScale(drawScale);
				debugDraw.SetFillAlpha(fillalpha);
				debugDraw.SetAlpha(alpha);
				debugDraw.SetLineThickness(lineThickness);
				debugDraw.SetFlags(this.b2DebugDraw.e_shapeBit | this.b2DebugDraw.e_jointBit);
				
				this.world.SetDebugDraw(debugDraw);
			},
			BaseBody:xengine.Class.extend({
				init:function(options){
					var params = {posX:0,posY:0,localX:0,localY:0,width:10,height:10,deg:0,type:0};
					options = xengine.$.extend(params, options || {});
					
					this.posX = parseInt(options.posX);
					this.posY = parseInt(options.posY);
					this.localX = parseInt(options.localX);
					this.localY = parseInt(options.localY);
					this.width = Math.max(1,options.width);
					this.height = Math.max(1,options.height);
					this.deg = parseInt(options.deg);
					this.type = Math.abs(options.type);
					
					this.b2Vec2 = xengine.EasyB2D.b2Vec2;
					this.b2Body = xengine.EasyB2D.b2Body;
					this.world = xengine.EasyB2D.world;
					this.b2PolygonShape = xengine.EasyB2D.b2PolygonShape;
					this.b2CircleShape = xengine.EasyB2D.b2CircleShape;

					this.bodyDef = new xengine.EasyB2D.b2BodyDef();
					this.fix = new xengine.EasyB2D.b2FixtureDef();
					this.shape = new this.b2PolygonShape();
					this.arcSimulateAnglePrecise = 10 /180*Math.PI;
					this.lenToB2d = xengine.fn.bind(xengine.EasyB2D,function(pixel){
						return this.lenToB2d(pixel);
					});
				},
				setBodyDef:function(){
					this.bodyDef.type = this.type;
					//记得米和像素的转换关系
					this.bodyDef.position.Set(this.lenToB2d(this.posX), this.lenToB2d(this.posY));
					this.bodyDef.userData = this;
					this.body = this.world.CreateBody(this.bodyDef);
				},
				setFixture:function(){
					this.fix.density = 0.6;
					this.fix.friction = 0.3;
					this.fix.restitution = 0.6;
					this.fix.shape = this.shape;
				},
				setBody:function(){
					if(this.type){
						this.body.CreateFixture(this.fix);
					}else{
						this.body.CreateFixture2(this.shape);
					}
				}
			}),
			//在Box2D世界中创建围绕canvas四周的墙体
			createWrapWall:function(options){
				var params = {w:10,h:10};
				options = xengine.$.extend(params, options || {});
			
				var w = Math.max(1,options.w),
					h = Math.max(1,options.h);

				var wallThick = 10;//in pixels				
			
				new xengine.EasyB2D.CreateBox({posX:w*0.5,posY:wallThick*0.5,width:w,height:wallThick});
				new xengine.EasyB2D.CreateBox({posX:w*0.5,posY:h-wallThick*0.5,width:w,height:wallThick});
				new xengine.EasyB2D.CreateBox({posX:wallThick*0.5,posY:h*0.5,width:wallThick,height:h});
				new xengine.EasyB2D.CreateBox({posX:w-wallThick*0.5,posY:h*0.5,width:wallThick,height:h});
			},
			//设置碰撞监听器
			setContactListener:function(ltn){
				this.world.SetContactListener(ltn);
			},
			//设置碰撞过滤器
			setContactFilter:function(flt){
				this.world.SetContactFilter(flt);
			},
			//移除物体
			remove:function(b){
				this.world.DestroyBody(b);
			},
			checkByUserData:function(checkA,checkB,targetA,targetB,n){
				var uDataA = checkA.GetUserData(),
					uDataB = checkB.GetUserData();
				uDataA = uDataA[n] || uDataA;
				uDataB = uDataB[n] || uDataB;
				
				if(uDataA == targetA && uDataB == targetB){
					return [checkA,checkB];
				}else if(uDataA == targetB && uDataB == targetA){
					return [checkB,checkA];
				}
			},
			customGravity:function(body,anchor){
				body.m_customGravity = anchor;
			},
			//设置材质
			setFixture:function(body,options){
				options || (options = {});
				var fix = body.GetFixtureList();
				fix.SetDensity(options.density || 0.6);
				fix.SetFriction(options.friction || 0.3);
				fix.SetRestitution(options.restitution || 0.6);
			},
			//获取一个空刚体
			getEmptyBody:function(){
				return this.world.GetGroundBody();
			},
			//获取鼠标滑过的刚体
			getBodyAt:function(px,py){
				px = this.lenToB2d(px);
				py = this.lenToB2d(py);
				
				//转换鼠标坐标单位，除以30从m该为px
				var mouseVector = new this.b2Vec2(px,py);
				//鼠标下的刚体
				var bodyAtMouse = null;
				//利用QueryPoint方法查找鼠标滑过的刚体
				//queryPoint函数中要用到的回调函数，注意，它必须有一个b2Fixture参数
				this.world.QueryPoint(function(fixture){
					if(fixture == null){ return; }
					//如果fixture不为null，设置为鼠标下的刚体
					bodyAtMouse = fixture.GetBody();				   
				}, mouseVector);
				//返回找到的刚体
				return bodyAtMouse;	
			},
			//用鼠标关节拖动刚体
			dragBodyTo:function(bodyB,mouseX,mouseY,targetX,targetY,maxForce,isStrictDrag){
				if (bodyB == null){ return; }//如果鼠标下的刚体不为空
				if (bodyB.GetType() != this.b2Body.b2_dynamicBody){ return; }
				mouseX = this.lenToB2d(mouseX);
				mouseY = this.lenToB2d(mouseY);
				targetX = this.lenToB2d(targetX);
				targetY = this.lenToB2d(targetY);
				
				if(this.mouseJoint == null){
					//创建鼠标关节需求
					var mouseJointDef = new this.b2MouseJointDef();
					mouseJointDef.bodyA = this.getEmptyBody();//设置鼠标关节的一个节点为空刚体，GetGroundBody()可以理解为空刚体
					mouseJointDef.bodyB = bodyB;//设置鼠标关节的另一个刚体为鼠标点击的刚体
					mouseJointDef.target.Set(targetX, targetY);//更新鼠标关节拖动的点
					mouseJointDef.frequencyHz = 1;//回弹的频率
					mouseJointDef.dampingRatio = 0;//回弹的阻尼系数
					mouseJointDef.maxForce = maxForce*bodyB.GetMass();//设置鼠标可以施加的最大的力
					
					//创建鼠标关节
					this.mouseJoint = this.world.CreateJoint(mouseJointDef);
				}
				
				var mouseVector = new this.b2Vec2(mouseX,mouseY);
				if(isStrictDrag || bodyB.GetJointList()==null){
					bodyB.SetPosition(mouseVector);
				}
				this.mouseJoint.SetTarget(mouseVector);
			},
			//停止拖动world中的刚体
			stopDragBody:function(){
				if (this.mouseJoint != null) {
					this.world.DestroyJoint(this.mouseJoint);
					this.mouseJoint=null;
				}
			},
			createPrismaticJoint:function(bodyB,anchor,axis){
				var jointDef = new this.b2PrismaticJointDef(),
					bodyA = this.getEmptyBody();
				jointDef.Initialize(bodyA,bodyB,anchor,axis);
				jointDef.enableMotor = true;
				jointDef.maxMotorForce = bodyB.GetMass()*10;	
				jointDef.motorSpeed = 0;
				return this.world.CreateJoint(jointDef);
			},
			createLineJoint:function(bodyB,anchor,axis){
				var jointDef = new this.b2LineJointDef(),
					bodyA = this.getEmptyBody();
				jointDef.Initialize(bodyA,bodyB,anchor,axis);
				jointDef.enableMotor = true;
				jointDef.maxMotorForce = bodyB.GetMass()*10;	
				jointDef.motorSpeed = 0;
				return this.world.CreateJoint(jointDef);
			},
			createRevoluteJoint:function(bodyA,bodyB,anchor){
				var jointDef = new this.b2RevoluteJointDef();
				jointDef.Initialize(bodyA,bodyB,anchor);
				jointDef.enableMotor = true;
				jointDef.maxMotorTorque = bodyB.GetMass()*10;	
				jointDef.motorSpeed = 0;
				return this.world.CreateJoint(jointDef);
			},
			createDistanceJoint:function(bodyA,bodyB,anchorA,anchorB){
				var jointDef = new this.b2DistanceJointDef();
				jointDef.Initialize(bodyA,bodyB,anchorA,anchorB);
				return this.world.CreateJoint(jointDef);
			},
			createWeldJoint:function(bodyA,bodyB,anchor){
				var jointDef = new this.b2WeldJointDef();
				jointDef.Initialize(bodyA,bodyB,anchor);
				return this.world.CreateJoint(jointDef);
			},
			createPulleyJoint:function(bodyA,bodyB,groundA,groundB,anchorA,anchorB,r){
				var jointDef = new this.b2PulleyJointDef();
				jointDef.Initialize(bodyA,bodyB,groundA,groundB,anchorA,anchorB,r);
				return this.world.CreateJoint(jointDef);
			},
			createFrictionJoint:function(bodyA,bodyB,anchor){
				var jointDef = new this.b2FrictionJointDef();
				jointDef.bodyA = bodyA;
				jointDef.bodyB = bodyB;
				jointDef.localAnchorA = new this.b2Vec2();
				jointDef.localAnchorB = new this.b2Vec2();
				jointDef.maxForce= bodyB.GetMass()*50;
				jointDef.maxTorque = 10;
				return this.world.CreateJoint(jointDef);
			},
			createGearJoint:function(joint1,joint2,ratio){
				var jointDef = new this.b2GearJointDef();
				jointDef.joint1 = joint1;
				jointDef.joint2 = joint2;
				jointDef.bodyB = this.getEmptyBody();
				jointDef.ratio = ratio;
				return this.world.CreateJoint(jointDef);
			},
			createFuliController:function(anchor,offset,density,linearDrag,angularDrag){
				var fuliController = new this.b2BuoyancyController();
				fuliController.normal = anchor;
				//设置水面的位置
				fuliController.offset = offset;
				//设置水的密度，因为我们创建的刚体密度是3，所以水的密度要大于3
				fuliController.density = density;
				//设置刚体在水中的移动阻尼
				fuliController.linearDrag = linearDrag;
				//设置刚体在水中的旋转阻尼
				fuliController.angularDrag = angularDrag;
				return this.world.AddController(fuliController);
			},
			destroyJoint:function(joint){
				this.world.DestroyJoint(joint);
			},
			destroyJointWith:function(body){
				tempJointEdge = body.GetJointList();
				if(tempJointEdge!=null){
					this.destroyJoint(tempJointEdge.joint);
				}
			}
		}
	});
	
	xengine.$.extend(xengine.EasyB2D, {
		//创建并返回一个多边形的b2Body刚体对象所需的形状和材质											  
		CreateBox:xengine.EasyB2D.BaseBody.extend({
			init:function(options){
				this._super(options);
				this.setBodyDef();
				this.setShape();
				this.setFixture();
				this.setBody();
			},
			setShape:function(){
				this.shape.SetAsOrientedBox(
					this.lenToB2d(this.width*0.5),
					this.lenToB2d(this.height*0.5),
					new this.b2Vec2(this.lenToB2d(this.localX),this.lenToB2d(this.localY)),
					this.deg
				);
			}
		}),	
		CreateCircle:xengine.EasyB2D.BaseBody.extend({
			init:function(options){
				var params = {radius:10};
				options = xengine.$.extend(params, options || {});
				
				this.radius = Math.max(1, options.radius);
				this._super(options);
				this.setBodyDef();
				this.setShape();
				this.setFixture();
				this.setBody();
			},
			setShape:function(){
				this.shape = new this.b2CircleShape();
				this.shape.SetRadius(this.lenToB2d(this.radius));
				this.shape.SetLocalPosition(new this.b2Vec2(this.lenToB2d(this.localX), this.lenToB2d(this.localY)));
			}
		}),										  
		CreatePolygon:xengine.EasyB2D.BaseBody.extend({
			init:function(options){
				var params = {vertices:[]};
				options = xengine.$.extend(params, options || {});
				
				this.vertices = options.vertices;
				this._super(options);
				this.setBodyDef();
				this.setShape();
				this.setFixture();
				this.setBody();
			},
			setShape:function(){
				var vertices = [];
				for(var i in this.vertices){
					vertices.push(new this.b2Vec2(
						this.lenToB2d(this.vertices[i].x),
						this.lenToB2d(this.vertices[i].y)
					));
				}
				this.shape.SetAsArray(vertices, vertices.length);
			}
		}),
		CreateEdge:xengine.EasyB2D.BaseBody.extend({
			init:function(options){
				var params = {vector1:{},vector2:{}};
				options = xengine.$.extend(params, options || {});
				
				this.vector1 = options.vector1;
				this.vector2 = options.vector2;
				this._super(options);
				this.setBodyDef();
				this.setShape();
				this.setFixture();
				this.setBody();
			},
			setShape:function(){
				var v1 = new this.b2Vec2(this.lenToB2d(this.vector1.x),this.lenToB2d(this.vector1.y)),
					v2 = new this.b2Vec2(this.lenToB2d(this.vector2.x),this.lenToB2d(this.vector2.y));
				this.shape.SetAsEdge(v1,v2);
			}
		}),
		CreateChain:xengine.EasyB2D.BaseBody.extend({
			init:function(options){
				var params = {vertices:[],isloop:false};
				options = xengine.$.extend(params, options || {});
				
				this.vertices = options.vertices;
				this.isloop = !!options.isloop;
				this._super(options);
				this.setBodyDef();
				this.setShape();
			},
			setShape:function(){
				var startPoint = new this.b2Vec2(
					this.lenToB2d(this.vertices[0].x),
					this.lenToB2d(this.vertices[0].y)
				);
				var prePoint = startPoint.Copy();
				var p = new this.b2Vec2();
				
				for (var i = 1; i < this.vertices.length; i++){
					p.x = this.lenToB2d(this.vertices[i].x);
					p.y = this.lenToB2d(this.vertices[i].y);
					this.shape = this.b2PolygonShape.AsEdge(prePoint, p);
					this.setBody();
					prePoint = p.Copy();
				}
				if(this.isloop){
					this.shape = this.b2PolygonShape.AsEdge(prePoint, startPoint);
					this.setBody();
				}
			},
			setBody:function(){
				this.body.CreateFixture2(this.shape,1).SetFriction(1);
			}
		}),
		MultiBody:xengine.EasyB2D.BaseBody.extend({
			init:function(options){
				this._super(options);
				this.setBodyDef();
				this.setShape();
			},
			setFixture:function(density,friction,restitution,shape,userData){
				this.fix.density = density;
				this.fix.friction = friction;
				this.fix.restitution = restitution;
				this.fix.shape = shape;
				this.fix.userData = userData;
			}
		})
	});
	
	xengine.$.extend(xengine.EasyB2D, {
		//组合法创建圆环
		CreateRing:xengine.EasyB2D.MultiBody.extend({
			init:function(options){
				var params = {segmentNum:1,radius:10};
				options = xengine.$.extend(params, options || {});
				
				//定义线段的个数
				this.segmentNum = Math.max(1,options.segmentNum);
				//定义圆形边界的半径
				this.radius = Math.max(1,options.radius);
				this._super(options);
			},
			setShape:function(){		
				//根据半径和个数计算线段的长度
				var segmentlength = this.radius * Math.sin(Math.PI/this.segmentNum);
				//for循环创建segmentNum个线段，合成圆形边界
				for (var i = 0; i < this.segmentNum; i++) {
					//计算每个线段的角度、坐标
					var angle = i/this.segmentNum *Math.PI*2,
						bx = this.radius * Math.cos(angle),
						by = this.radius * Math.sin(angle),
						userData = {w:this.width,h:segmentlength,x:bx,y:by,deg:angle};
					
					this.shape.SetAsOrientedBox(
						this.lenToB2d(this.width),
						this.lenToB2d(segmentlength),
						new this.b2Vec2(this.lenToB2d(bx),this.lenToB2d(by)),
						angle
					);
					
					this.setFixture(0.6,0.3,0.6,this.shape,userData);
					this.setBody();
				}
			}
		}),
		//组合法创建圆角矩形
		CreateFillet:xengine.EasyB2D.MultiBody.extend({
			init:function(options){
				var params = {radius:10};
				options = xengine.$.extend(params, options || {});

				//定义圆形边界的半径
				this.radius = Math.max(1,options.radius);
				this._super(options);
			},
			setShape:function(){
				var b2Width = this.width*0.5,
					b2height = this.height*0.5,
					b2Radius = this.radius*0.5,
					offsetX = b2Width - b2Radius,
					offsetY = b2height - b2Radius;
					
				if(offsetX < 1 || offsetY < 1) throw Error("the size is too small");
				
				//创建两个矩形
				this.shape.SetAsOrientedBox(this.lenToB2d(b2Width), this.lenToB2d(b2height - b2Radius), new this.b2Vec2());
				this.setFixture(0.6,0.3,0.6,this.shape,{w:b2Width*2,h:(b2height - b2Radius)*2});
				this.setBody();
				this.shape.SetAsOrientedBox(this.lenToB2d(b2Width - b2Radius), this.lenToB2d(b2height), new this.b2Vec2());
				this.setFixture(0.6,0.3,0.6,this.shape,{w:(b2Width - b2Radius)*2,h:b2height*2});
				this.setBody();
				
				//然后分别在四个角上创建四个圆形实现圆角效果
				this.shape = new this.b2CircleShape();
				this.shape.SetRadius(this.lenToB2d(b2Radius));
				this.shape.SetLocalPosition(new this.b2Vec2(this.lenToB2d(-offsetX), this.lenToB2d(-offsetY)));
				this.setFixture(0.6,0.3,0.6,this.shape,{t:'circle',r:b2Radius,x:-offsetX,y:-offsetY});
				this.setBody();
				this.shape.SetLocalPosition(new this.b2Vec2(this.lenToB2d(offsetX), this.lenToB2d(-offsetY)));
				this.setFixture(0.6,0.3,0.6,this.shape,{t:'circle',r:b2Radius,x:offsetX,y:-offsetY});
				this.setBody();
				this.shape.SetLocalPosition(new this.b2Vec2(this.lenToB2d(-offsetX), this.lenToB2d(offsetY)));
				this.setFixture(0.6,0.3,0.6,this.shape,{t:'circle',r:b2Radius,x:-offsetX,y:offsetY});
				this.setBody();
				this.shape.SetLocalPosition(new this.b2Vec2(this.lenToB2d(offsetX), this.lenToB2d(offsetY)));
				this.setFixture(0.6,0.3,0.6,this.shape,{t:'circle',r:b2Radius,x:offsetX,y:offsetY});
				this.setBody();
			}
		}),
		//半圆
		CreateSemiCircle:xengine.EasyB2D.CreatePolygon.extend({
			setShape:function(){
				var w = this.width,
					h = this.height,
					r = (h*h+w*w/4)/h/2,
					angleSize = Math.acos((r-h)/r)*2;
				if(angleSize<this.arcSimulateAnglePrecise){ throw Error("the angle of semicircle is too small"); }
				var verticesCount = Math.floor(Math.PI*2/this.arcSimulateAnglePrecise * angleSize/Math.PI/2);

				for (var i= 0; i < verticesCount; i++) {
					this.vertices.push(new this.b2Vec2(
						r*Math.cos(this.arcSimulateAnglePrecise*i + (Math.PI-angleSize)/2),
						r*Math.sin(this.arcSimulateAnglePrecise*i + (Math.PI-angleSize)/2) -r+h
					));
				}
				this.vertices.push(new this.b2Vec2(
					r*Math.cos(angleSize + (Math.PI-angleSize)/2),
					r*Math.sin(angleSize + (Math.PI-angleSize)/2) -r+h
				));

				this._super();
			}
		}),
		//梯形
		CreateTrapezium:xengine.EasyB2D.CreatePolygon.extend({
			init:function(options){
				var params = {twidth:10,bwidth:10};
				options = xengine.$.extend(params, options || {});
				
				this.twidth = Math.max(1,options.twidth);
				this.bwidth = Math.max(1,options.bwidth);
				this._super(options);
			},
			setShape:function(){
				this.vertices.push(new this.b2Vec2(-this.twidth/2,-this.height/2));
				this.vertices.push(new this.b2Vec2(this.twidth/2,-this.height/2));
				this.vertices.push(new this.b2Vec2(this.bwidth/2,this.height/2));
				this.vertices.push(new this.b2Vec2(-this.bwidth/2,this.height/2));
				this._super();
			}
		}),
		//等边多边形
		CreateRegular:xengine.EasyB2D.CreatePolygon.extend({
			init:function(options){
				var params = {radius:10,verticesCount:1};
				options = xengine.$.extend(params, options || {});
				
				this.radius = Math.max(1,options.radius);
				this.verticesCount = Math.max(1,options.verticesCount);
				this._super(options);
			},
			setShape:function(){
				var angle = Math.PI * 2 / this.verticesCount;//每个顶点之间的角度间隔
				
				//移动到第一个顶点
				for (var i=0; i< this.verticesCount; i++){
					//计算每个顶点
					this.vertices.push(new this.b2Vec2(
						this.radius * Math.cos( i * angle+ (Math.PI - angle)/2),
						this.radius * Math.sin( i * angle+(Math.PI - angle)/2)
					));
				}		
				this._super();
			}
		}),
		//扇形
		CreateFan:xengine.EasyB2D.CreatePolygon.extend({
			init:function(options){
				var params = {radius:10,angleSize:10};
				options = xengine.$.extend(params, options || {});
				
				this.radius = Math.max(1,options.radius);
				this.angleSize = Math.max(1,options.angleSize);
				this._super(options);
			},
			setShape:function(){
				//if(this.angleSize>180) throw Error("the angle of fan is over 180");
				this.angleSize = this.angleSize/180*Math.PI;
				
				var verticesCount = parseInt(Math.PI*2/this.arcSimulateAnglePrecise * this.angleSize/Math.PI/2)+1;
				
				for (var i= 0; i < verticesCount; i++) {
					this.vertices.push(new this.b2Vec2(
						this.radius*Math.cos(this.arcSimulateAnglePrecise*i + (Math.PI-this.angleSize)/2),
						this.radius*Math.sin(this.arcSimulateAnglePrecise*i + (Math.PI-this.angleSize)/2)
					));
				}
				this.vertices.push(new this.b2Vec2(
					this.radius*Math.cos(this.angleSize + (Math.PI-this.angleSize)/2),
					this.radius*Math.sin(this.angleSize + (Math.PI-this.angleSize)/2)
				));			
				
				this._super();
			}
		}),
		//椭圆
		CreateEllipse:xengine.EasyB2D.CreatePolygon.extend({
			setShape:function(){
				var verticesCount = parseInt(Math.PI*2/this.arcSimulateAnglePrecise);
				for (var i = 0; i < verticesCount; i++){
					this.vertices.push(new this.b2Vec2(
						this.width/2*Math.cos(this.arcSimulateAnglePrecise*i),
						this.height/2*Math.sin(this.arcSimulateAnglePrecise*i)
					));
				}
				this._super();
			}
		})
	});				 
})(this,xengine);
