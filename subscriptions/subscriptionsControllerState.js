angular.module('app').service('SubscriptionsState', function(){
	
	
	this.initialized = false;
	this.ready = false;
	
	this.init = function(){
		if(!this.initialized){
			console.log('init   SubscriptionsState');
			this.signedIn				= false;
			this.initialized			= true;
			this.intervalPromise		= null;
			this.subscriptions			= new Array();
			this.subscriptionsLookup	= new Object();
			// updating ?
		}
	};
	
	this.reset = function(){
		console.log('reset  SubscriptionsState');
		this.signedIn				= false;
		this.initialized			= false;
		this.ready					= false;
		this.intervalPromise		= null;
		this.subscriptions			= new Array();
		this.subscriptionsLookup	= new Object();
	};
	
	
	
	
});
