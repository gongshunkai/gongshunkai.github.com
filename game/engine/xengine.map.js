/*!
 * xengine.map plugin
 * By xiangfeng
 * Please contact to xiangfenglf@163.com if you hava any question
 * xengine 游戏地图类
 */
(function(root,xengine){
	xengine.$.extend(xengine, {
		Map:{
			//定义点对象
			Point:function(x,y){
				this.x = x;
				this.y = y;
				this.parent = null;
				this.f = 0;
				this.g = 0;
				this.h=0;
				//当前点状态，0：表示在openlist 1:表示closelist,-1表示还没处理
				this.state=-1;
				//flag表明该点是否可通过
				this.flag = 0;
			},
			//产生随机迷宫
			primMaze:function(r,c){
				//初始化数组
				function init(r,c){
					var a = new Array(2*r+1);
					//全部置1
					for(var i=0,len=a.length;i<len;i++){
						var cols = 2*c+1;
						a[i]= new Array(cols);
						xengine.fn.ArrayUtil.fillWith(a[i],1);
					}
					//中间格子为0
					for(var i=0;i<r;i++){
						for(var j=0;j<c;j++){
							a[2*i+1][2*j+1] = 0;
						}
					}
					return a;
				}
				//处理数组，产生最终的数组
				function process(arr){
					//acc存放已访问队列，noacc存放没有访问队列
					var acc = [],
						noacc = [];
					var r = arr.length>>1,
						c=arr[0].length>>1;
					var count = r*c;
					for(var i=0;i<count;i++){noacc[i]=0;}
					//定义空单元上下左右偏移
					var offs=[-c,c,-1,1],
						offR=[-1,1,0,0],
						offC=[0,0,-1,1];
					//随机从noacc取出一个位置
					var pos = xengine.fn.MathUtil.randInt(count);
					noacc[pos]=1;
					acc.push(pos);
					while(acc.length<count){
						var ls = -1,
							offPos = -1;
							offPos = -1;
						//找出pos位置在二维数组中的坐标
						var pr = pos/c|0,
							pc=pos%c,
							co=0,o=0;
						//随机取上下左右四个单元
						while(++co<5){
							o = xengine.fn.MathUtil.randInt(0,5);
							ls =offs[o]+pos;
							var tpr = pr+offR[o];
							var tpc = pc+offC[o];
							if(tpr>=0&&tpc>=0&&tpr<=r-1&&tpc<=c-1&&noacc[ls]==0){ offPos = o;break;}
						}
						if(offPos<0){
							pos = acc[xengine.fn.MathUtil.randInt(acc.length)];
						}
						else{
							pr = 2*pr+1;
							pc = 2*pc+1;
							//相邻空单元中间的位置置0
							arr[pr+offR[offPos]][pc+offC[offPos]]=0;
							pos = ls;
							noacc[pos] = 1;
							acc.push(pos);
						}
					}
				}
				var a = init(r,c);
				process(a);
				return a;
			},
			//把普通二维数组(全部由1，0表示)的转换成a*所需要的点数组
			convertArrToAS:function(arr){
				var r = arr.length,
					c=arr[0].length;
				var a = new Array(r);
				for(var i=0;i<r;i++){
					a[i] = new Array(c);
					for(var j=0;j<c;j++){
						var pos = new this.Point(i,j);
						pos.flag = arr[i][j];
						a[i][j]=pos;
					}
				}
				return a;
			},
			//A*算法,pathArr表示最后返回的路径
			findPathA:function(pathArr,start,end,row,col){
				//添加数据到排序数组中
				function addArrSort(descSortedArr,element,compare){
					var left = 0;
					var right = descSortedArr.length-1;
					var idx = -1;
					var mid = (left+right)>>1;
					while(left<=right){
						var mid = (left+right)>>1;
						if(compare(descSortedArr[mid],element)==1){
							left = mid+1;
						}
						else if(compare(descSortedArr[mid],element)==-1){
							right = mid-1;
						}
						else{
							break;
						}
					}
					for(var i = descSortedArr.length-1;i>=left;i--){
						descSortedArr[i+1] = descSortedArr[i];
					}
					descSortedArr[left] = element;
					return idx;
				}
				//判断两个点是否相同
				function pEqual(p1,p2){
					return p1.x==p2.x&&p1.y==p2.y;
				}
				//获取两个点距离，采用曼哈顿方法
				function posDist(pos,pos1){
					return (Math.abs(pos1.x-pos.x)+Math.abs(pos1.y-pos.y));
				}
				function between(val,min,max){
					return (val>=min&&val<=max)
				}
				//比较两个点f值大小
				function compPointF(pt1,pt2){
					return pt1.f-pt2.f;
				}
				//处理当前节点
				function processCurrpoint(arr,openList,row,col,currPoint,destPoint){
					//get up,down,left,right direct
					var ltx = currPoint.x-1;
					var lty = currPoint.y-1;
					for(var i=0;i<3;i++){
						for(var j=0;j<3;j++){
							var cx = ltx+i;
							var cy = lty+j;
							if((cx==currPoint.x||cy==currPoint.y)&&between(ltx,0,row-1)&&between(lty,0,col-1)){
								var tp = arr[cx][cy];
								if(tp.flag == 0 && tp.state!=1){
									if(pEqual(tp,destPoint)){
										tp.parent = currPoint;
										return true;
									}
									if(tp.state == -1){
										tp.parent = currPoint;
										tp.g= 1+currPoint.g;
										tp.h= posDist(tp,destPoint);
										tp.f = tp.h+tp.f;
										tp.state = 0
										addArrSort(openList,tp,compPointF);
									}
									else{
										var g = 1+currPoint.g
										if(g<tp.g){
											tp.parent = currPoint;
											tp.g = g;
											tp.f = tp.g+tp.h;
											openList.quickSort(compPointF);
										}
									}
								}
							}
						}
					}
					return false;
				}
				//定义openList
				var openList = [];
				//定义closeList
				var closeList = [];
				start = pathArr[start[0]][start[1]];
				end = pathArr[end[0]][end[1]];
				//添加开始节点到openList;
				addArrSort(openList,start,compPointF);
				var finded = false;
				var tcount = 0;
				while((openList.length>0)){
					var currPoint = openList.pop();
					currPoint.state = 1;
					closeList.push(currPoint);
					finded = processCurrpoint(pathArr,openList,row,col,currPoint,end);
					if(finded){
						break;
					}
				}
				if(finded){
					var farr = [];
					var tp = end.parent;
					farr.push(end);
					while(tp!=null){
						farr.push(tp);
						tp = tp.parent;
					}
					return farr;
				}
				else{
					return null;
				}
			}
		}
	});
})(this,xengine);
