xengine.game.addListener(new xengine.EventListener({
	"beforeRender":function(){
		
	},
	"afterRender":function(){
		
	}
}));
xengine.game.run(-1,function(){

	var sc = new Scene({w:400,h:500,color:'#222'});
	xengine.director.runScene(sc);
	
	
	
	
	
	
	
	
	
	
	
	//var galaxian = new Galaxian();
	
	/*var sc = new xengine.Scene({w:400,h:500});
	xengine.director.runScene(sc);
	
	var pcfg = cfg.player;
	var pScale = 0.4;
	var player = new Player();
	player.scaleX = pScale;
	player.scaleY = pScale;
	player.moveTo((sc.w-pcfg.w*pScale) * 0.5,sc.h-pcfg.h*pScale*0.5);
	player.w = pcfg.w*pScale;
	player.h = pcfg.h*pScale;
	player.color = 'white';
	sc.addChild(player);
	_player = player;*/
	
	//loadLevel(sc);
	
	
	
	
	setInterval(function(){
		for(var i=0,obj;obj=sc.rObjs[i++];){
			var r = MathUtil.randInt(0,sc.rObjs.length - 1);
			if(r || obj.groupID != 1){ continue; }
			obj.targetX = sc.player.x;
			obj.targetY = sc.player.y;
			obj.sCtx.change("attack");
		}
	},500);
	/*setInterval(function(){
		var b = cache.shift() || new Bullet();
		sc.addChild(b);
		
		b.x=player.x+player.w*0.5-2.5;
		b.y=player.y-player.h;
		b.w=5;
		b.h=15;
		b.dx = 0;
		b.dy = -3;
		b.color='white';
		cache.push(b);
	},500);*/
		
		
	var posX = 0;
	xengine.Mouse.sDLG("down",function(e){							  
		posX = e.clientX - sc.player.x;
			
	});
	xengine.Mouse.sDLG("move",function(e){								  
		if(xengine.Mouse.gBtnState(e.button) && e.clientX-posX > sc.x+sc.player.w*0.5 && e.clientX-posX < sc.w-sc.player.w*1.5){
			sc.player.x = e.clientX-posX;
		}	
	});
});
						   
