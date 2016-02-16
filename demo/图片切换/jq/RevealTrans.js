var RevealTrans = jutil.Class.create();
jutil.extend(RevealTrans.prototype,{
  initialize: function(container, options) {
    this.container = $(container);
	this._img = $('<img>');
	this._a = $('<a></a>');
	
	this._timer = null;//计时器
	this.Index = 0;//显示索引
	this._onIndex = -1;//当前索引
	
	//设置默认属性
	var params = {Auto:true,Pause:1000,Duration:1,Transition:23,List:[],onShow:function(){}};
	options = jutil.extend(params,options || {});
	
	//是否自动切换
	this.Auto = !!options.Auto;
	//停顿时间(毫秒)
	this.Pause = Math.abs(options.Pause);
	//变换持续时间(秒)
	this.Duration = Math.abs(options.Duration);
	//变换效果(23为随机)
	this.Transition = parseInt(options.Transition);
	//数据集合,如果这里不设置可以用Add方法添加
	this.List = options.List;
	//变换时执行
	this.onShow = options.onShow;
	
	//初始化显示区域
	this._img.css({'visibility':'hidden','width':'100%','height':'100%','border':'0','filter':'revealTrans()'});//第一次变换时不显示红x图
	this._img.on('mouseover',jutil.bind(this, this.Stop));
	this._img.on('mouseout',jutil.bind(this, this.Start));
	
	this._a.attr('target','_blank');
	
	$(container).append(this._a).append(this._img);
  },
  Start: function() {
	clearTimeout(this._timer);
	//如果没有数据就返回
	if(!this.List.length){
		return false;
	}
	//修正Index
	if(this.Index < 0 || this.Index >= this.List.length){
		this.Index = 0;
	}
	//如果当前索引不是显示索引就设置显示
	if(this._onIndex != this.Index){
		this._onIndex = this.Index;
		this.Show(this.List[this.Index]);
	}
	//如果要自动切换
	if(this.Auto){
		this._timer = setTimeout(jutil.bind(this, function(){
			this.Index++; this.Start();
		}), this.Duration * 1000 + this.Pause);
	}
  },
  //显示
  Show: function(list) {
	this._img.css('visibility','');
	//设置图片属性
	this._img.attr({'src':list.img,'alt':list.text});
	//设置链接
	!!list["url"] ? this._a.attr('href',list["url"]) : this._a.removeAttr('href');
	//附加函数
	this.onShow();
  },
  //添加变换对象
  Add: function(sIimg, sText, sUrl) {
	this.List.push({ img: sIimg, text: sText, url: sUrl });
  },
  //停止
  Stop: function() {
	clearTimeout(this._timer);
  }
});