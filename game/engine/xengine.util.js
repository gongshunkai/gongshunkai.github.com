/*!
 * xengine.util plugin
 * By xiangfeng
 * Please contact to xiangfenglf@163.com if you hava any question
 * xengine 游戏工具类
 */
(function(root,xengine){
	xengine.$.extend(xengine.fn, {
		//浏览器工具类
		BrowseUtil:{
			//获取浏览器适合的css前缀
			getPrefix4CSS:function(){
				
			}
		},
		//JSON工具类
		JSONUtil:{
			isEmpty:function(obj){
				for(var i in obj){
					return false;
				}
				return true;
			}
		},
		//资源工具类
		ResUtil:{
			loadFile:function(fileURL,type,fn,sync){
				var ct = "text/xml;charset=UTF-8";
				var dt = type||"json";
				if(dt=="json"){
					ct = "text/x-json;charset=UTF-8";
				}
				xengine.$.ajax({
					url:fileURL,
					async:(sync==null?false:sync),
					type:"GET",
					dataType:dt,
					contentType:ct,
					error:function(){
						console.log("Load File ["+fileURL+"] Error!");
					},
					success:function(data){
						console.log("Load File ["+fileURL+"] Successful!")
						fn(data);
					}
				});
			}
		},
		//队列类
		Queue:function(cap){
			var _MAXDEF  = 9,
				capacity = cap+1,
				head = 0,
				tail = 0,
				data = [];
			this.empty = function(){ data.length = 0 ;}
			this.isEmpty = function(){ return (head==tail); }
			this.isFull = function(){ return  ((tail+1)%capacity == head); }
			this.add = function(val){
				if(this.isFull()){
					return -1;
				}
				data[tail] = val;
				tail = (tail+1)%capacity;
			};
			this.remove = function(){
				var result = null;
				if(!this.isEmpty()){
					result = data[head];
					head = (head+1)%capacity;
				}
				return result;
			};
		},
		//数组工具类
		ArrayUtil:{
			//移出arr中索引为idx的项目
			removeByIdx:function(arr,idx){
				arr&&arr.splice(idx,1);
			},
			removeFn:function(arr,fn){
				var idx=-1;
				for(var aIdx=0;aIdx<arr.length;aIdx++){
					if (fn(arr[aIdx])){
						idx = aIdx;
						break;
					}
				}
				if(idx!=-1){ arr.splice(idx,1); }
			},
			insert:function(arr,pos,ele){
				if((arr.length===0&&pos===0)||(pos===arr.length)){
					this.push(ele);
				}
				else if(pos<0||pos>arr.length){
					return;
				}
				else{
					var len = arr.length-pos;
					arr.splice(pos,len,ele,arr.slice(pos));
				}
			},
			fillWith:function(arr,val){
				for(var i=0,len=arr.length;i<len;i++){
					arr[i]=val;
				}
			}
		},
		//数学工具类
		MathUtil:{
			deg2rad:function(angle){
				return angle*0.017453292;
			},
			rad2deg:function(rad){
				return rad*57.29578;
			},
			lerp:function(a,b,r){
				return a*(1-r)+b*r;
			},
			//return a num between -range to range;
			randRange:function(range){
				return (Math.random()-0.5)*range*2;
			},
			//x>=min && x<max
			randInt:function(min,max){
				max=max||0;
				min=min||0;
				var step=Math.abs(max-min);
				var st = (arguments.length<2)?0:min;
				var result ;
				result = st+(Math.ceil(Math.random()*step))-1;
				return result;
			},
			dotV2:function(v1,v2){
				return v1.x*v2.x+v1.y*v2.y;
			},
			lenV2:function(v){
				return Math.sqrt(v.x*v.x+v.y*v.y);
			},
			normV2:function(v){
				var len = this.lenV2(v),
					rlen = 1/len;
				return {"x":v.x*rlen,"y":v.y*rlen};
			},
			//判断两个矩形是否相交
			isInRect:function(x1,y1,x2,y2,x3,y3,x4,y4){
				if(x1>x4||x2<x3)return false;
				if(y1>y4||y2<y3)return false;
				return true;
			},
			//获取两个矩形相交区域
			getInRect:function(x1,y1,x2,y2,x3,y3,x4,y4){
				return [Math.max(x1,x3),Math.max(y1,y3),Math.min(x2,x4),Math.min(y2,y4)];
			},
			//点是否在Rect中
			pInRect:function(x1,y1,x2,y2,w,h){
				return x1>=x2&&x1<=x2+w&&y1>=y2&&y1<=y2+h;
			},
			//以屏幕上左上角为原点，x1,y1为坐标的点转向以ox,oy为原点的坐标
			mapSToCoord:function(x1,y1,ox,oy){
				return [x1-ox,y1-oy];
			},
			//计算polyArr在axis上的投影,polyArr是一系列点坐标的集合,数组表示
			calcProj:function(axis,polyArr){
				var v = {"x":polyArr[0],"y":polyArr[1]};
				var d,min,max;
				min=max = this.dotV2(axis,v);
				for(var i=2;i<polyArr.length-1;i+=2){
					v.x=polyArr[i];
					v.y=polyArr[i+1];
					d = this.dotV2(axis,v);
					min = (d<min)?d:min;
					max = (d>max)?d:max;
				}
				return [min,max];
			},
			//计算同一个轴上线段的距离s1(min1,max1),s2(min2,max2),如果距离小于0则表示两线段有相交;
			segDist:function(min1,max1,min2,max2){
				if(min1<min2){
					return min2-max1;
				}
				else{
					return min1-max2;
				}
			},
			//判断两个多边形是否相交碰撞,p1,p2用于保存多边形点的数组
			isCollide:function(p1,p2){
				//定义法向量
				var e = {"x":0,"y":0};
				var p = p1,
					idx=0,
					len1=p1.length,
					len2=p2.length;
				for(var i=0,len = len1+len2;i<len-1;i+=2){
					idx = i;
					//计算两个多边形每条边
					if(i>len1){
						p=p2;
						idx=(i-len1);
					}
					if(i==p.length-2){
						px=p[0]-p[idx];
						py=p[1]-p[idx+1];
					}
					else{
						px = p[idx+2]-p[idx],
						py = p[idx+3]-p[idx+1];
					}
					//得到边的法向量
					e.x = -py;
					e.y = px;
					//计算两个多边形在法向量上的投影
					var pp1 = this.calcProj(e,p1);
					var pp2 = this.calcProj(e,p2);
					//计算两个线段在法向量上距离，如果大于0则可以退出，表示无相交
					if(this.segDist(pp1[0],pp1[1],pp2[0],pp2[1])>0){
						return false;
					}
				}
				return true;
			}
		},
		//颜色工具
		ColorUtil:{
			//产生颜色代码,r,g,b值为0~255
			rgb:function(r,g,b){
				var c = "#"+Number((r<<16)+(g<<8)+b).toString(16);
				return c;
			}
		},
		PubUtil:{
			merge:function(o,n,override){
				var o=o||{},
					n=n||{};
				for(p in n){
					if(n.hasOwnProperty(p)&&(!o.hasOwnProperty(p)||override)){
						o[p] = n[p];
					}
				}
				return o;
			}
		}
	});
})(this,xengine);
