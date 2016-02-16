var History = jutil.Class.create();
jutil.extend(History.prototype,{
  initialize:function(container,options){
	  this.container = document.getElementById(container);
	  this._div = document.createElement("div");
		
	  //设置默认属性
	  var params = {MaxSize:10,Expire:0,List:[],onShow:function(){}};
	  options = jutil.extend(params, options || {});
	
	  //浏览记录的最大数量(最大支持10个)
	  this.MaxSize = Math.abs(options.MaxSize);
	  //cookie的生命周期
	  this.Expire = parseInt(options.Expire);
	  //数据集合,如果这里不设置可以用Add方法添加
	  this.List = options.List;
	  //显示浏览记录
	  this.onShow = options.onShow;
	  
	  this._div.innerHTML = "暂无浏览记录";
	  this.container.appendChild(this._div);
  },
  setCookie:function(name,options){
	if(this.List.length >= this.MaxSize){
		return false;
	}
	  
	jutil.each(this.List, function(list,i){
	  if(options.url == list["url"]){ delete this.List[i]; }
    });
  
    this.Add(options.img, options.text, options.url, options.price);
   
	jutil.cookie(name, JSON.stringify(this.List), { raw:true,expires:this.Expire });	
  },
  getCookie:function(name){
    return jutil.cookie(name,{raw:true});
  },
  delCookie:function(name){
    jutil.cookie(name,null);
	this.List = [];
  },
  Add:function(sIimg, sText, sUrl, sPrice){
    this.List.push({ img:sIimg, text:sText, url:sUrl, price:sPrice });
  },
  Run:function(){
    this.onShow();
  }
});