var CascadeSelect = jutil.Class.create();
jutil.extend(CascadeSelect.prototype,{
	initialize:function(tabs,items,arrMenu,options){
		this.Menu = jutil.buildTree(arrMenu);

		this.Tabs = $(tabs);
		this.Items = $(items);
	
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
			li = $('<li></li>'),
			self = this;

		this.Tabs.find('li').each(function(){
			if($(this).attr('level') > self.Menu.pos[o.id].length){
				$(this).remove();
				return;
			}
			
			$(this).removeClass();
			$(this).find('a').removeClass();
			
			if($(this).attr('pid') == node.pid){
				$(this).find('a').attr("title",node.text);	
				$(this).find('a').attr("data-value",o.id);
				$(this).find('a').html("<em>" + node.text + "</em><i></i>");
			}
		});
		
		if(o.text.call(this,node) == this.EmptyText && menu.length < 1){
			this.onFinish();
			return;
		}
			
		li.attr('level',o.level(this.Menu.pos[o.id].length));
		li.attr('pid',o.pid(node));
		li.addClass('curr');
		li.html('<a class="curr" href="javascript:;" title="' + o.text.call(this,node) + '" data-value="' + o.id + '"><em>' + o.text.call(this,node) + '</em><i></i>');
		li.find('a').on('click',function(){
			self.Tabs.find('li').each(function(){					
				$(this).removeClass();
				$(this).find('a').removeClass();
			});
			li.addClass('curr');
			$(this).addClass('curr');
			self.SetSelect(o.menu.call(self,node));
		});
		this.Tabs.append(li);
		
		
		if(menu.length > 0){
			//获取菜单	
			this.SetSelect(menu);
		}else{
			//没有数据
			this.onFinish();
		}
	},
	SetSelect:function(menu){
	
		var ul = $('<ul></ul>'),
			self = this;
			
		this.Items.empty();
		this.Items.append(ul);
	
		if(menu.length <= 0){
			return;
		}
		
		$.each(menu, function(i,o){
			var li = $('<li></li>');
			li.attr('level',self.Menu.pos[o.id].length);
			li.html('<a href="javascript:;" data-value="' + o.id + '">' + o.text + '</a>');
			li.find('a').on('click',function(){
				self.FSM.build2["id"] = o.id;
				self.Set(self.FSM.build2);
			});
			ul.append(li);
		});
	}
});