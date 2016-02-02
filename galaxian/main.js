xengine.game.run(function(){
	
	var sc = new Scene({w:400,h:500,color:'#222'});
	xengine.director.push(sc);
	
	sc.addListener(new xengine.EventListener({
		"beforeRender":function(){
			
		},
		"afterRender":function(){
			//处理游戏过关
			if(cfg.enemyNum < 1){
				if(sc.level > cfg.maxLev){
					sc.menu || sc.createMenu();
					sc.isAttack = false;
				}else{
					++sc.level;
					sc.isXFlip = true;
					sc.removeChild(sc.layer);
					sc.createEnemy();
				}
			}
			//处理游戏结束
			if(sc.player.life < 1){
				sc.menu || sc.createMenu();
				sc.isAttack = false;
			}
		}
	}));
		
	var posX = 0;
	//鼠标事件
	xengine.Mouse.sDLG("down",function(e){							  
		posX = e.clientX - sc.player.x;	
	});
	xengine.Mouse.sDLG("move",function(e){								  
		if(xengine.Mouse.gBtnState(e.button) && e.clientX-posX > sc.x+sc.player.w && e.clientX-posX < sc.w-sc.player.w){
			sc.player.x = e.clientX-posX;
		}
	});
	xengine.Mouse.sDLG("click",function(e){								
		if(sc.restart && sc.restart.isMouseIn()){
			sc.clearAll();
			sc.loadGame();
		}
	});
	//触摸事件
	xengine.Touch.sDLG("start",function(e){							  
		var touch = e.touches[0]; //获取第一个触点
		posX = touch.clientX - sc.player.x;
	});
	xengine.Touch.sDLG("move",function(e){								  
		var touch = e.touches[0]; //获取第一个触点
		if(xengine.Touch.gState() && touch.clientX-posX > sc.x+sc.player.w && touch.clientX-posX < sc.w-sc.player.w){
			sc.player.x = touch.clientX-posX;
		}
	});
	
	/*document.ontouchstart = function(e){
		var touch = e.touches[0]; //获取第一个触点
		posX = touch.pageX - sc.player.x;
		
		document.ontouchmove = function(e){
			var touch = e.touches[0]; //获取第一个触点
			if(touch.pageX-posX > sc.x+sc.player.w && touch.pageX-posX < sc.w-sc.player.w){
				sc.player.x = touch.pageX-posX;
			}
		};
		document.ontouchend = function(){
			document.ontouchmove = null;
		};
	};*/
	
	window.onresize = function(){ sc.resize(); }
},30);


						   
