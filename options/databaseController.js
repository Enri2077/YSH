
angular.module('app').controller('DatabaseController', function(DatabaseService){
	
	DatabaseService.init();
	
	this.inc = function(){
		DatabaseService.inc();
		
		console.log("DatabaseController.inc()");
	};
	
	/*
	var t = this;
	this.bytesInUse = null;
	
	this.getDB = function(){
		
	}; 
	
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
	
	*/
});

