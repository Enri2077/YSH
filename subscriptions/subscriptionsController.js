
angular.module('app').controller('SubscriptionController', function(SubscriptionsState, HistoryService, SubscriptionService, cApis, Video, Subscription, $http, $scope, $interval){
	var t = this;
	
	SubscriptionsState.init();
	this.subscriptions		= SubscriptionsState.subscriptions;
	subscriptionsLookup		= SubscriptionsState.subscriptionsLookup;
	
	this.signIn = function(silent){
		cApis.auth(!silent, function(){ // asynchronous callback on token recevied
			$http.defaults.headers.common.Authorization = 'Bearer ' + cApis.authToken;
			
			SubscriptionsState.init();
			SubscriptionsState.signedIn = true;
			SubscriptionsState.ready = true;
			
			initSubscriptions();
			requestSubscriptions();
			
			console.log("signIn:", SubscriptionsState);
			
		}, function(error){
			if(error.message == "The user is not signed in."){}
			if(error.message == "OAuth2 not granted or revoked."){}
			if(error.message == "The user did not approve access."){}
			console.log("auth:", error.message);
			
			$scope.$apply(function(){
				SubscriptionsState.reset();
				t.subscriptions = SubscriptionsState.subscriptions;
				subscriptionsLookup = SubscriptionsState.subscriptionsLookup;
			});
		});
	};
	initSubscriptions = function(){
		SubscriptionService.getSubscriptions(function(storedSubscriptionsLookup){
			console.log("stored subs:", storedSubscriptionsLookup);
			
			//subList = [];
			// populate the array from the lookup
			Object.keys(storedSubscriptionsLookup).forEach(function(channelId){
				subscriptionsLookup[channelId] = storedSubscriptionsLookup[channelId];
				t.subscriptions.unshift(subscriptionsLookup[channelId]);
				//subList.push(channelId);
				console.log("load   sub", subscriptionsLookup[channelId].title, subscriptionsLookup[channelId]);
			});
			//console.log(subList);
		});
	};
	if(!SubscriptionsState.ready) this.signIn(true);
	chrome.identity.onSignInChanged.addListener(this.signIn);
	
	this.isSignedIn = function(){
		//console.log(SubscriptionsState.signedIn);
		return SubscriptionsState.signedIn;
	};
	
	this.update = function(){
		if(!$scope.updating>0){
			console.log("updateAllSubscriptions", (new Date()));
			requestSubscriptions();
		}
	};
	
	// start the timed updates
	if(!SubscriptionsState.intervalPromise) SubscriptionsState.intervalPromise = $interval(t.update, 10/*m*/ * 60/*s/m*/ * 1000/*ms/s*/);
	$scope.$on('$destroy', function(){
		console.log("$scope destroying");
		if(SubscriptionsState.intervalPromise){
			$interval.cancel(SubscriptionsState.intervalPromise);
			SubscriptionsState.intervalPromise = null;
		}
	});
	
	$scope.update = this.update;
	$scope.updating = 0;
	
	this.updateFeeds = function(subscription){
		if(!$scope.updating>0){
			requestFeedsAfter(subscription, null, function(){
				SubscriptionService.saveSubscription(subscription);
				console.log("updateSubscription", subscription.title, (new Date()));
			});
		}
	};
	
	requestSubscriptions = function(pageToken){
		$scope.updating = $scope.updating + 1;
		
		requestUrl = "https://www.googleapis.com/youtube/v3/subscriptions";
		query_parameters = {
			"part" 			: "snippet,contentDetails",
			"maxResults"	: "50",
			"mine"		 	: "true",
			"key" 			: "AIzaSyCGQi6WwvIhr62iyFcdg_b0PKOSUbb4mKw",
			"pageToken"		: pageToken || "",
		};
		makeRequest($http, requestUrl, query_parameters, function(response){
			response.items.forEach(function(responseSubscription){
				if(!subscriptionsLookup[responseSubscription.snippet.resourceId.channelId]){
					// if new subscription, use the responseSubscription
					var subscription = Subscription.apiResponseTransformer(responseSubscription);
					subscriptionsLookup[subscription.channelId] = subscription;
					
					console.log("new    sub", subscription.title, subscription);
					
					SubscriptionService.getSubscriptionData(subscription, function(h, p){
						subscription.history = h;
						subscription.pinPriority = p;
						
						requestFeedsAfter(subscription, false, function(){
							
							if(subscription.hasUploads()){
								t.subscriptions.unshift(subscription);
								console.log("insert sub", subscription.title, subscription);
							}else{
								t.subscriptions.push(subscription);
								console.log("push   sub", subscription.title, subscription);
							}
							
							SubscriptionService.saveSubscription(subscription);
						});
					});
				
				}else{
					// if not a new subscription, update the feeds
					var subscription = subscriptionsLookup[responseSubscription.snippet.resourceId.channelId];
					console.log("check  sub", subscription.title, subscription);
					subscription.updateInfo(responseSubscription);
					
					if(subscription.isLoved() || subscription.isFavorited() || subscription.etag != responseSubscription.etag){ // Heuristic: Figure out if the feeds have changed, if so request the feeds again
						console.log("update sub", subscription.title, subscription);
						
						subscription.etag = responseSubscription.etag;
						
						subscription.updateLastUploadDate();
						after = (new Date((new Date(subscription.lastUploadDate)).getTime()+1000)).toISOString();
						
						requestFeedsAfter(subscription, after, function(){
							SubscriptionService.saveSubscription(subscription);
						});
					}
				}
			});
			
			if(response.nextPageToken){
				requestSubscriptions(response.nextPageToken);
				$scope.updating = $scope.updating - 1;
			}else{
				$scope.updating = $scope.updating - 1;
			}
		}, function(){ //onError
			$scope.updating = $scope.updating - 1;
			console.log("error managed");
		});
	};
	
	
	requestFeedsAfter = function(subscription, after, callback){
		$scope.updating = $scope.updating + 1;
		
		requestUrl = "https://www.googleapis.com/youtube/v3/activities";
		query_parameters = {
			"part" 			: "snippet,contentDetails",
			"maxResults"	: "50",
			"channelId" 	: subscription.channelId,
			"key" 			: "AIzaSyCGQi6WwvIhr62iyFcdg_b0PKOSUbb4mKw",
			"pageToken"		: subscription.nextPageToken || "",
		};
		if(after) query_parameters.publishedAfter = after;
		
		makeRequest($http, requestUrl, query_parameters, function(response){
			//update the page token
			subscription.nextPageToken = response.nextPageToken;
			
			// for each upload feed (activities.list), add the feed in uploads
			response.items.forEach(function(feed){
				
				if(feed.snippet.type == "upload"
				&& !subscription.hasFeedInHistory(feed)
				&& !subscription.hasFeedInUploads(feed)){
				
					subscription.pushUpload(Video.apiActivityResponseTransformer(feed));
				}
			});
			
			// sort the uploads //TODO can be removed?
			subscription.sortUploads();
			
			if(response.nextPageToken){
				requestFeedsAfter(subscription, after, callback);
				
				$scope.updating = $scope.updating - 1;
			}else{	// post requestFeedsAfter
				
				// clear the pageToken
				subscription.nextPageToken = null;
				
				subscription.updateLastUploadDate();
				
				if(callback) callback();
				
				$scope.updating = $scope.updating - 1;
			}
		}, function(){ //onError
			$scope.updating = $scope.updating - 1;
			console.log("error managed");
		});
	};
	
	
	
	this.isSubscriptionFavorited = function(subscription){
		return subscription.pinPriority==1;
	};
	this.setFavoriteSubscription = function(subscription){
		subscription.toggleFavorited();
		SubscriptionService.saveSubscriptionOptions(subscription);
	};
	this.isSubscriptionLoved = function(subscription){
		return subscription.pinPriority==2;
	};
	this.setLoveSubscription = function(subscription){
		subscription.toggleLoved();
		SubscriptionService.saveSubscriptionOptions(subscription);
	};
	
	
	
	this.addToHistory = function(upload, subscription, hidden){
		historyEntry = upload.toHistoryObject(hidden, new Date());
		
		HistoryService.storeHistoryEntries([historyEntry]);
		subscription.addToHistory(historyEntry);
		subscription.removeUpload(upload);
		SubscriptionService.saveSubscription(subscription);
	};
	
	this.addAllToHistory = function(subscription){
		entries = new Array();
			
		subscription.uploads.forEach(function(upload){
			var historyEntry = upload.toHistoryObject(true, new Date());
			entries.push(historyEntry);
			subscription.addToHistory(historyEntry);
		});
		
		subscription.resetUploads();
		HistoryService.storeHistoryEntries(entries);
		SubscriptionService.saveSubscription(subscription);
	};
	
	// generic HTTP Request with $http
	function makeRequest($http, url, query_parameters, onSuccess, onError, retryCount){
		var parameters = query_parameters || {};
		var paramString = "";
		retryCount = retryCount || 0;

		var firstParameter = true;
		for(var key in parameters) {
			if(firstParameter){
				paramString += "?"+key+"="+parameters[key];
				firstParameter = false;
			}else{
				paramString += "&"+key+"="+parameters[key];
			}
		}
	
		$http.get(url+paramString).success(onSuccess).error(function(data, status, headers, config){
			if(status == "401"){
				if(retryCount<3){
					// refresh the authToken and set it again in the header
					cApis.auth(false, function(){
						$http.defaults.headers.common.Authorization = 'Bearer ' + cApis.authToken;
						makeRequest($http, url, query_parameters, onSuccess, onError, retryCount+1)
					});
				}else{
					if(onError) onError(data, status, headers, config);
				}
			}else{
				if(onError) onError(data, status, headers, config);
			}
		});
	
	};
	
});

