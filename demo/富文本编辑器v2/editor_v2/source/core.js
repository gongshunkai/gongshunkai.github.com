/*********************** 核心类 ******************************/

//参考文档：JS Range HTML文档/文字内容选中、库及应用介绍：http://www.zhangxinxu.com/wordpress/2011/04/js-range-html%E6%96%87%E6%A1%A3%E6%96%87%E5%AD%97%E5%86%85%E5%AE%B9%E9%80%89%E4%B8%AD%E3%80%81%E5%BA%93%E5%8F%8A%E5%BA%94%E7%94%A8%E4%BB%8B%E7%BB%8D/

var userSelection = (function(){

    var selection, range, node;

    return {
        
        //保存Rang
        save:function(target){

            if (window.getSelection) { //现代浏览器
                selection = window.getSelection();
                range = selection.rangeCount && selection.getRangeAt(0);
            } else if (document.selection) { //IE浏览器 考虑到Opera，应该放在后面
                selection = document.selection.createRange();
            }

            /*if(hasBro.isIE()){
                selection = document.selection.createRange();
            }
            else{
                selection = selection || window.getSelection();
                range = range || selection.getRangeAt(0);
            }*/
        
            node = target;

        },

        pasteHTML:function(str){
            if(selection.pasteHTML){
                selection.pasteHTML(str);
            }else{
                range.insertNode($(str).get(0));
            }
        },

        htmlText:function(){
            //return hasBro.isIE() ? selection.htmlText : selection.text || selection.toString();
            return selection.htmlText || selection.text || selection.toString();
        },

        //恢复光标选择区域
        reselect:function(){

            if(selection.moveStart){
                selection.moveStart('character',0);
                selection.select();
            }else{
                if(range){
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }

            /*if(hasBro.isIE()){

                selection.moveStart('character',0);
                selection.select();

            }else{
                
                if(range){
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

            }*/
        },

        //根据DOM元素恢复光标选择
        selectNode:function(node){

            if(selection.moveToElementText){
                selection.moveToElementText(node);
                selection.select();
            }else{

                if(range){       
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                range.selectNodeContents(node);
            }

            /*if(hasBro.isIE()){

                selection.moveToElementText(node);
                selection.select();

            }else{

                if(range){       
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                range.selectNodeContents(node);
            }*/
        },

        //光标聚集到最后
        keepLastIndex:function(node) {
            if(selection.moveToElementText){
               
            }else{
                node.focus(); //解决ff不获取焦点无法定位问题
                range.selectNodeContents(node);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        },

        anchorNode:function(){
            return selection.anchorNode;
        },

        //根据用户的光标选择获取当前文本节点的父级元素
        parentElement:function(mode){

            if(!mode && node){
                return node;
            }else{
                return selection.parentElement ? 
                    selection.parentElement()
                :
                    selection.anchorNode ? 
                        selection.anchorNode.parentNode 
                    : 
                        document.createElement('div');

                /*return hasBro.isIE() ? 
                    selection.parentElement()
                :
                    selection.anchorNode.parentNode;*/
            }
              
        }
    };
})();

var preventControlSelect = function(node){
    if(node.attachEvent){
        node.attachEvent('oncontrolselect',function(e){
            e.returnValue = false;
        });
    }else{
        node.addEventListener('mscontrolselect',function(e){
            e.preventDefault();
        })
    }
};

//禁用图像和其他对象的大小可调整大小手柄
var enableControlSelect = (function(){

    var once = false;

    return function(editable){

        if(hasBro.isIE()){

            editable.find('img,table').each(function(){
                preventControlSelect($(this).get(0));
            });

        }else{

            if(!once){

                once = true;

                //启用或禁用图像和其他对象的大小可调整大小手柄。(IE浏览器不支持)
                document.execCommand('enableObjectResizing',false,false);
                document.execCommand('enableInlineTableEditing',false,false);
            }

        }
    }

})();

/*统一各浏览器按回车键插入P标签
火狐默认BR
谷歌默认DIV
IE默认P
解决办法：当空文本时，往编辑器插入一个P标签，即可修改火狐或谷歌默认的标签
         当编辑器的值发生变化，如果字符数量大于10才开始查找DOM元素
         如果字符数量小于10且不含P标签则插入一个p标签*/
var insertParagraph = function(editable){
    
    //如果字符数量小于10且不含P标签则插入一个p标签
    if(editable.html().length < 10 && !editable.find('p').length){
        
        //IE不做处理，火狐用execCommand命令，其他浏览器用append方法
        if(!hasBro.isIE()){
            if(hasBro.isFF()){
                document.execCommand('insertParagraph',false);
            }else{
                editable.append('<p><br></p>');
            }
        }
    }
};

//光标所在位置的所有父节点信息
//返回一个对象包含：指令名称集合、节点名称集合、节点属性集合
var selectParentsInfo = function(nodeInfo,parentName){

    var tagNames = [],
        attributes = {},
        elements = [];

    var setAttribute = function(attrs){

        for(var i in attrs){
            var attr = attrs[i] || {}; //IE9+ 会有NULL
            for(var k in nodeInfo.attributes){
                if(attr.name===k && !attributes[k])
                    attributes[k] = attr.value;
            }
        }
    };

    var addInfo = function(element){
        if(element.get && element.get(0)){

            var tagName = element.get(0).tagName,
                attributes = element.get(0).attributes;

            tagNames.push(tagName);     
            elements.push(element);             

            //拿到元素与字典匹配的所有属性和属性值
            setAttribute(attributes);
        }

        return element;
    };

    var element = userSelection.parentElement();

    addInfo($(element)).parentsUntil(parentName || 'body').each(function(){
        addInfo($(this));
    });

    return {
        tagNames:tagNames,
        attributes:attributes,
        elements:elements
    };

};