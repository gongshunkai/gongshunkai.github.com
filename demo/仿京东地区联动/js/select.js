var CascadeSelect = jutil.Class.create();
jutil.extend(CascadeSelect.prototype,{
	initialize:function(tabs,items,arrMenu,options){
		this.Menu = jutil.buildTree(arrMenu);

		this.Tabs = document.getElementById(tabs);
		this.Items = document.getElementById(items);
	
		//设置默认属性
		var params = {Default:[],EmptyText:"请选择",onFinish:function(){}};
		options = jutil.extend(params,options || {});
		
		//默认值(按顺序)
		this.Default = options.Default; 
		//空值显示文本
		this.EmptyText = options.EmptyText;
		//完成选择时执行
		this.onFinish = options.onFinish;
		
		for(var i=0;i<this.Default.length;i++){
			this.FSM.build1["id"] = this.Default[i];
			this.Set(this.FSM.build1);
		}
	},
	FSM:{
		build1:{
			level:function(l){
				return l;
			},
			pid:function(node){
				return node.pid;
			},
			text:function(node){
				return node.text;
			},
			menu:function(node){
				return node.pid == 0 ? this.Menu.tree : this.Menu.findCurrentNode(node.pid).children;
			}
		},
		build2:{
			level:function(l){
				return l+1;
			},
			pid:function(node){
				return node.id;
			},
			text:function(){
				return this.EmptyText;
			},
			menu:function(node){
				return node.children;
			}
		}
	},
	Set:function(o){
		var node = this.Menu.findCurrentNode(o.id),
			menu = node.children || [],
			arrLi = this.Tabs.getElementsByTagName('li');
		
		for(var i=0;i<arrLi.length;i++){
			if(arrLi[i].getAttribute('level') > this.Menu.pos[o.id].length){
				this.Tabs.removeChild(arrLi[i]);
				i--;
				continue;
			}
			
			arrLi[i].className = "";
			arrLi[i].querySelector('a').className = "";
			
			if(arrLi[i].getAttribute('pid') == node.pid){
				arrLi[i].querySelector('a').setAttribute("title",node.text);	
				arrLi[i].querySelector('a').setAttribute("data-value",o.id);
				arrLi[i].querySelector('a').innerHTML = "<em>" + node.text + "</em><i></i>";
			}
		}
		
		if(o.text.call(this,node) == this.EmptyText && menu.length < 1){
			this.onFinish();
			return;
		}
		
		var self = this,
			li = document.createElement('li');
			
		li.setAttribute('level',o.level(this.Menu.pos[o.id].length));
		li.setAttribute('pid',o.pid(node));
		li.className = "curr";
		li.innerHTML = '<a class="curr" href="javascript:;" title="' + o.text.call(this,node) + '" data-value="' + o.id + '"><em>' + o.text.call(this,node) + '</em><i></i>';
		li.querySelector('a').onclick = function(){
			for(var i=0;i<arrLi.length;i++){
				arrLi[i].className = "";
				arrLi[i].querySelector('a').className = "";
			}
			li.className = "curr";
			this.className = "curr";
			self.SetSelect(o.menu.call(self,node));
		};
		this.Tabs.appendChild(li);
		
		
		if(menu.length > 0){
			//获取菜单	
			this.SetSelect(menu);
		}else{
			//没有数据
			this.onFinish();
		}
	},
	SetSelect:function(menu){
	
		var ul = document.createElement('ul'),
			self = this;
			
		this.Items.innerHTML = "";
		this.Items.appendChild(ul);
	
		if(menu.length <= 0){
			return;
		}
		
		jutil.each(menu, function(o){
			var li = document.createElement('li');
			li.setAttribute('level',self.Menu.pos[o.id].length);
			li.innerHTML = '<a href="javascript:;" data-value="' + o.id + '">' + o.text + '</a>';
			li.querySelector('a').onclick = function(){
				self.FSM.build2["id"] = o.id;
				self.Set(self.FSM.build2);
			};
			ul.appendChild(li);
		});
	}
});