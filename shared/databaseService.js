"use strict";
function DatabaseService(){};

angular.module('app').factory('DatabaseService', function(Subscription, Video){
	return new DatabaseService();
});
	
	// initialise service variables
	
//DatabaseService.prototype.initialised = false;

//console.log("DatabaseService", DatabaseService.prototype.i, DatabaseService.prototype.initialised);

DatabaseService.prototype.init = function(){
	return;
	DatabaseService.prototype.i = 0;
	DatabaseService.prototype.initialised = true;
	console.log("DatabaseService INIT", DatabaseService.prototype.i, DatabaseService.prototype.initialised);
};

DatabaseService.prototype.inc = function(){
	return;
	DatabaseService.prototype.i = DatabaseService.prototype.i + 1;
	console.log("DatabaseService", DatabaseService.prototype.i, DatabaseService.prototype.initialised);
}

	
	/*
	// TODO convert uploads from storageObjects to Video
	this.getSubscriptions = function(callback){
		chrome.storage.local.get(['subscriptions','history', 'subscriptionOptions'], function(storage){
			console.log("getSubscriptions:", storage);
			
			if(!storage.subscriptions)			storage.subscriptions = new Object();
			if(!storage.history)				storage.history = new Object();
			if(!storage.subscriptionOptions)	storage.subscriptionOptions = new Object();
			
			var subscriptionsLookup = new Object();
			
			Object.keys(storage.subscriptions).forEach(function(channelId){
				
				var storageSubscription = storage.subscriptions[channelId];
				
				var history = storage.history[channelId] || new Array();
				var options = storage.subscriptionOptions[channelId] || new Object();
				var pinPriority = options.pinPriority || 0;
				var uploads = new Array();
				
				if(storageSubscription.uploads){
					storageSubscription.uploads.forEach(function(storageUpload){
						uploads.push(Video.fromStorageObject(storageUpload));
					});
				}
				
				subscriptionsLookup[channelId] = Subscription.fromStorageObject(storageSubscription, pinPriority, history, uploads);
				
			});
			
			callback(subscriptionsLookup);
		});
	};
	*/
	
	/*
	this.getSubscriptionData = function(subscription, callback){
		chrome.storage.local.get(['history', 'subscriptionOptions'], function(storage){
			if(!storage.subscriptionOptions) 							storage.subscriptionOptions = new Object();
			if(!storage.subscriptionOptions[subscription.channelId])	storage.subscriptionOptions[subscription.channelId] = {"pinPriority": 0};
			if(!storage.history)										storage.history = new Object();
			if(!storage.history[subscription.channelId])				storage.history[subscription.channelId] = new Array();
			
			callback(storage.history[subscription.channelId], storage.subscriptionOptions[subscription.channelId].pinPriority);
		});
	};
	*/
	
	/*
	this.saveSubscription = function(subscription, callback){
		var s = this;
	
		if(subscriptionsWriteLock){
			if(subscriptionsQueue.length <= subscriptionsQueueLimit){
				subscriptionsQueue.push(subscription);
				//console.log("subscriptionsWriteLock: write queued ", subscriptionsQueue.length);
				if(callback) callback();
				return;		
			}else{
				console.log("subscriptionsWriteLock: write dropped ", subscriptionsQueue.length);
				if(callback) callback();
				return;		
			}
			
		}
		subscriptionsWriteLock = true;
		
		chrome.storage.local.get('subscriptions', function(storage){
			if(!storage.subscriptions){
				console.log("saveSubscription: subscriptions not defined; assigning new object");
				storage.subscriptions = new Object();
			}
			
			if(compareSubs(storage.subscriptions[subscription.channelId], subscription.toStorageObject())){
				
				if(subscriptionsQueue.length){
					
					var unqueuedSubscription = subscriptionsQueue.shift();
					//console.log("subscriptionsWriteLock: write unqueued ", subscriptionsQueue.length);
					subscriptionsWriteLock = false;
					s.saveSubscription(unqueuedSubscription, callback);
				}else{
					subscriptionsWriteLock = false;
					if(callback) callback();
				}
			}else{
				storage.subscriptions[subscription.channelId] = subscription.toStorageObject();
				//console.log("save   sub", subscription.toStorageObject());
				
				chrome.storage.local.set(storage, function(){
					
					if(subscriptionsQueue.length){
						
						var unqueuedSubscription = subscriptionsQueue.shift();
						//console.log("subscriptionsWriteLock: write unqueued ", subscriptionsQueue.length);
						subscriptionsWriteLock = false;
						s.saveSubscription(unqueuedSubscription, callback);
					}else{
						subscriptionsWriteLock = false;
						if(callback) callback();
					}
					
				});
				
			}
			
		});
	};
	*/
	
	/*
	this.saveSubscriptionOptions = function(subscription, callback){
		chrome.storage.local.get('subscriptionOptions', function(storage){
			if(!storage.subscriptionOptions){
				console.log("saveSubscriptionOptions: subscription options not defined; assigning new object");
				storage.subscriptionOptions = new Object();
			}
			
			storage.subscriptionOptions[subscription.channelId] = {pinPriority: subscription.pinPriority};
			
			chrome.storage.local.set(storage, callback);
		
		});
	};
	*/
	
	/*
	// TODO find appropriate place for compareSubs
	function compareSubs(s1, s2){
		if(s1 == undefined || s2 == undefined) return false;
		
		if((s1.uploads!=undefined) != (s2.uploads!=undefined)) return false;
		
		if(s1.uploads && s2.uploads) if(s1.uploads.length != s2.uploads.length) return false;
		return true;
	};
	*/


