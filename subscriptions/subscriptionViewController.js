
angular.module('app').controller('SubscriptionViewController', function(){
	
	this.expanded = false;
	
	this.toggleExpanded = function(){
		this.expanded = !this.expanded;
	};
	
	this.uploadsLimit = function(){
		return this.expanded ? 1000 : 10;
	};
	
});

