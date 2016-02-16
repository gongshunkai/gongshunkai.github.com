//参考：http://www.cnblogs.com/cloudgamer/archive/2008/06/24/1228736.html
var CascadeSelect = jutil.Class.create();
jutil.extend(CascadeSelect.prototype,{
  initialize: function(arrSelects, arrMenu, options) {  
  
    var self = this;
	
	this.DataTree = jutil.buildTree(arrMenu);
	this.Selects = [];//select集合
	
	//设置默认属性
	var params = {Default:[],Visible:0,ShowEmpty:false,EmptyText:[]};
	options = jutil.extend(params, options || {});
	
	//默认值(按顺序) 
	this.Default = options.Default || [];
	//空值显示的数量
	this.Visible = Math.abs(options.Visible);
	//是否显示空值(位于第一个)
    this.ShowEmpty = !!options.ShowEmpty;
	//空值显示文本(ShowEmpty为true时有效)
    this.EmptyText = options.EmptyText || [];
	
	//设置Selects集合和change事件
    jutil.each(arrSelects, function(o, i){
		jutil.addEvent((self.Selects[i] = document.getElementById(o)), "change", function(){ self.Set(i); });
    });
	
	this.ReSet();
  },
  //初始化select
  ReSet: function() {
	this.SetSelect(0, this.DataTree.tree, this.Default.shift());
    this.Set(0);
  },
  //全部select设置
  Set: function(index) {
    var menu = this.DataTree.tree;
    
    //第一个select不需要处理所以从1开始
    for(var i=1; i<this.Selects.length; i++){
        if(menu.length > 0){
            //获取菜单
            var value = this.Selects[i-1].value;
            if(value!=""){
				var o = this.DataTree.findCurrentNode(value);
                if(o.id == value){ menu = o.children || []; }
            } else { menu = []; }
            
            //设置菜单
            if(i > index){ this.SetSelect(i, menu, this.Default.shift()); }
        } else {
            //没有数据
            this.SetSelect(i, [], "");
        }
    }
    //清空默认值
    this.Default.length = 0;
  },
  //select设置
  SetSelect: function(i, menu, value) {
	var oSel = this.Selects[i];
    oSel.options.length = 0; oSel.disabled = false; oSel.setAttribute("style","");

    if(this.ShowEmpty){ oSel.appendChild(jutil.getOption("", this.EmptyText[i])); }
    if(menu.length <= 0){
		oSel.disabled = true;
		if(i>this.Visible){oSel.style.display = "none";}
		return;
	}
    
    jutil.each(menu, function(o){
        var op = jutil.getOption(o.id, o.text ? o.text : o.id); op.selected = (value == op.value);
        oSel.appendChild(op);
    });
  }
});