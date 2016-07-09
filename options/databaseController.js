
angular.module('app').controller('DatabaseController', function(DatabaseService){
	
	DatabaseService.init();
	
	this.inc = function(){
		DatabaseService.inc();
		
		console.log("DatabaseController.inc()");
	};
	
	this.test = function(){
		s = new Object();
		s.provaObject = new Object();
		s.provaObject['a'] = "A";
		s.provaObject['b'] = "B";
		
		chrome.storage.local.set(s, function(){
			chrome.storage.local.get('provaObject', function(storage){
				console.log('1', storage.provaObject['a'], storage.provaObject['b']);
				
				s2 = {provaObject: {'a': "AAA"}};
				
				chrome.storage.local.set(s2, function(){
					chrome.storage.local.get('provaObject', function(storage){
						console.log('2', storage.provaObject['a'], storage.provaObject['b']);
		
					});		
				})
			});		
		})
	}
	
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

