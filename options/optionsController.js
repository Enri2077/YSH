
angular.module('app').controller('OptionsController', ['cApis', '$scope', function(cApis, $scope){
	var t = this;
	this.bytesInUse = null;
	
	this.update = function(){
		cApis.getBytesInUse(function(B){
			$scope.$apply(function(){
				t.bytesInUse = B;
			});
		});
	};
	
	$scope.update = this.update;
	
	this.update();
	
	this.wipeStorage = function(){
		cApis.wipeStorage(function(){
			t.update();
		});
	};
	
	this.wipeHistory = function(){
		cApis.wipeHistory(function(){
			t.update();
		});
	};
	
	
	this.wipeSubscriptionsState = function(){
		cApis.wipeSubscriptionsState(function(){
			t.update();
		});
	};
	
	
}]);

