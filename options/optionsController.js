
angular.module('app').controller('OptionsController', function(cApis, DatabaseService, $scope){
	var t = this;
	this.bytesInUse = null;
	this.db = null;
	
	this.update = function(){
		cApis.getBytesInUse(function(B){
			$scope.$apply(function(){
				t.bytesInUse = B;
			});
		});
		
		/*
		cApis.getDB(function(db){
			$scope.$apply(function(){
				t.db = db;
			});
		});
		*/
		
	};
	
	
	this.inc = function(){
		DatabaseService.inc();
		
		console.log("OptionsController.inc()");
	};
	
	$scope.update = this.update;
	
	this.update();
	
	
	this.exportDatabase = function(){
		cApis.doExportToDisk();
	};
	
	
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
	
	
	
});

