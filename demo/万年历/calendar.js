var Calendar = jutil.Class.create();
jutil.extend(Calendar.prototype,{
	initialize:function(container, options){
		this.Container = document.getElementById(container);//容器(table结构)
		this.Days = [];//日期对象列表
		
		//设置默认属性
		var params = {Year:0,Month:0,SelectDay:null,onSelectDay:function(){},onToday:function(){},onFinish:function(){}};
		options = jutil.extend(params,options || {});
		
		//显示年
		this.Year = options.Year || new Date().getFullYear();
		//显示月
		this.Month = options.Month || new Date().getMonth() + 1;
		//选择日期
		this.SelectDay = options.SelectDay ? new Date(options.SelectDay) : null;
		//在选择日期触发
		this.onSelectDay = options.onSelectDay;
		//在当天日期触发
		this.onToday = options.onToday;
		//日历画完后触发
		this.onFinish = options.onFinish;    
		
		this.Draw();
	},
	DateList:{
		//当前月
		nowMonth:function() {
			this.PreDraw(new Date());
		},
		//上一月
		preMonth:function() {
			this.PreDraw(new Date(this.Year, this.Month - 2, 1));
		},
		//下一月
		nextMonth:function() {
			this.PreDraw(new Date(this.Year, this.Month, 1));
		},
		//上一年
		preYear:function() {
		   this.PreDraw(new Date(this.Year - 1, this.Month - 1, 1));
		},
		//下一年
		nextYear:function() {
			this.PreDraw(new Date(this.Year + 1, this.Month - 1, 1));
		}
	},
	//根据日期画日历
	PreDraw: function(date) {
		//再设置属性
		this.Year = date.getFullYear(); this.Month = date.getMonth() + 1;
		//重新画日历
		this.Draw();
	},
	//画日历
	Draw: function() {
		//用来保存日期列表
		var arr = [];
		//用当月第一天在一周中的日期值作为当月离第一天的天数
		for(var i = 1, firstDay = new Date(this.Year, this.Month - 1, 1).getDay(); i <= firstDay; i++){ arr.push(0); }
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(this.Year, this.Month, 0).getDate(); i <= monthDay; i++){ arr.push(i); }
		//清空原来的日期对象列表
		this.Days = [];
		//插入日期
		var frag = document.createDocumentFragment();
		while(arr.length){
			//每个星期插入一个tr
			var row = document.createElement("tr");
			//每个星期有7天
			for(var i = 1; i <= 7; i++){
				var cell = document.createElement("td"); cell.innerHTML = "&nbsp;";
				if(arr.length){
					var d = arr.shift();
					if(d){
						cell.innerHTML = d;
						this.Days[d] = cell;
						var on = new Date(this.Year, this.Month - 1, d);
						//判断是否今日
						this.IsSame(on, new Date()) && this.onToday(cell);
						//判断是否选择日期
						this.SelectDay && this.IsSame(on, this.SelectDay) && this.onSelectDay(cell);
					}
				}
				row.appendChild(cell);
			}
			frag.appendChild(row);
		}
		//先清空内容再插入(ie的table不能用innerHTML)
		while(this.Container.hasChildNodes()){ this.Container.removeChild(this.Container.firstChild); }
		this.Container.appendChild(frag);
		//附加程序
		this.onFinish();
	},
	//判断是否同一日
	IsSame: function(d1, d2) {
		return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
	}
});