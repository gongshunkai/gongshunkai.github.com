(function(window, angular) {

	'use strict';

    var ngEditor = angular.module('ngEditor', []);
    ngEditor.constant('editorConfig', {
    	height: 200,
    	toolbarButtons: 'full',
    	skinClassName:null,
    	oninitialized: null       	
	});
    ngEditor.directive('ngEditor', ['$timeout', 'editorConfig', function($timeout, editorConfig) {

        return {
            scope: {
                content: '='
            }, 
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            template: '<div></div>',
            replace: true,
            link: function($scope, iElm, iAttrs, controller) {

                var editor = Editor(iElm[0],editorConfig);

                var nowContent = '';

                editor.on('initialized', function(){

                	editor.setSource($scope.content); 
                	
                	$scope.$watch('content', function(value, old){
	                    if(typeof value !== 'undefined' && value != nowContent){
	                    	editor.setSource(value); 
	                    }
	                });
                }); 

                editor.on('valuechanged', function(){
                    if($scope.content != editor.getSource()){
                    	$timeout(function(){
							$scope.content = nowContent = editor.getSource();
						});
                    }
                });
            }
        };
    }]);

})(window, window.angular);
