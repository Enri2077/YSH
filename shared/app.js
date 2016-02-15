
var app = angular.module('app', ['ngtimeago', 'infinite-scroll', 'ngRoute']);

app.config(['$routeProvider',function($routeProvider){
	$routeProvider.
	when('/subscriptions', {
		templateUrl: 'subscriptions/subscriptions.html',
		controller: 'SubscriptionController as subCtrl'
	}).
	when('/subSelection', {
		templateUrl: 'subSelection/sub-selection.html',
		controller: 'SubscriptionSelectionController as selCtrl'
	}).
	when('/history', {
		templateUrl: 'history/history.html',
		controller: 'HistoryController as hisCtrl'
	}).
	when('/options', {
		templateUrl: 'options/options.html',
		controller: 'OptionsController as optCtrl'
	}).
	when('/database', {
		templateUrl: 'options/database.html',
		controller: 'DatabaseController as dbCtrl'
	}).
	otherwise({
		redirectTo: '/subscriptions'
	});
}]);

//app.service('DatabaseService', databaseService);

app.service('SubscriptionService', subscriptionService);

app.service('HistoryService', historyService);

app.factory('Subscription', modelSubscription);

app.factory('Video', modelVideo);

app.factory('cApis', function() {
	var cApis = new ChromeApis();
	return cApis;
});

app.directive('yshVideoBox', function() {
	return {
		restrict: 'E',
		templateUrl: '../directives/ysh-video-box.html'
	};
});

app.directive('yshHistoryEntryBox', function() {
	return {
		restrict: 'E',
		templateUrl: '../directives/ysh-history-entry-box.html'
	};
});

app.directive('yshNavbar', function() {
	return {
		restrict: 'E',
		templateUrl: '../directives/ysh-navbar.html'
	};
});


/*
app.service('MessageService', function(){
	this.n = 1;
	
	console.log("MessageService");
	
	this.inc = function(){
		this.n = this.n + 1;
		console.log("MessageService.inc", this.n);
	};
	
	this.reset = function(){
		console.log("MessageService.resetUnreadNotifications");
		this.n = 0;
	};
});
*/

