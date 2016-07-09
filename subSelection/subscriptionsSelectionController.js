
app.controller('SubscriptionSelectionController', ['$http', '$scope', 'cApis', 'Subscription', 'SubscriptionService', function($http, $scope, cApis, Subscription, SubscriptionService){
	var t = this;
	this.signedIn = false;
	
	this.subscriptions = new Array();
	subscriptionsLookup = new Object();
	
	t.subsRes = new Array();
	
	subRank = function(){
		//return t.subsRes;
		
		
		t.subsRes.sort(function (s1, s2) {
			return s1.snippet.publishedAt.localeCompare(s2.snippet.publishedAt);
		});
		t.subsRes.forEach(function(s){
			console.log(s.snippet.publishedAt, s.snippet.title);
		});
	}
	
	this.signIn = function(silent){
		cApis.auth(!silent, function() { // asynchronous callback on token recevied
			t.signedIn = true;
		
			// Include common headers (auth)
			$http.defaults.headers.common.Authorization = 'Bearer ' + cApis.authToken;
			
			SubscriptionService.getSubscriptions(function(storedSubscriptionsLookup){
				
				console.log("stored subs:", storedSubscriptionsLookup);
				
				// populate the array from the lookup
				Object.keys(storedSubscriptionsLookup).forEach(function(channelId){
					
					subscriptionsLookup[channelId] = storedSubscriptionsLookup[channelId];
					t.subscriptions.unshift(subscriptionsLookup[channelId]);
					
					console.log("load   sub", subscriptionsLookup[channelId].title);
				});
				
				// start to fetch the subscriptions and the feeds
				requestSubscriptions();
			});
			
		}, function(error){
			if(error && error.message == "The user is not signed in."){
				t.signedIn = false;
			}
			console.log("error:", error);
		});
	};
	
	this.signIn(true);
	chrome.identity.onSignInChanged.addListener(this.signIn);
	
	this.update = function(){
		if(!$scope.updating>0){
			console.log("updateAllSubscriptions", (new Date()));
			requestSubscriptions();
		}
	};
	
	$scope.update = this.update;
	$scope.updating = 0;
	
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
				
				t.subsRes.unshift(responseSubscription);
				
				
				if(!subscriptionsLookup[responseSubscription.snippet.resourceId.channelId]){
					// if new subscription, use the responseSubscription
					var subscription = Subscription.apiResponseTransformer(responseSubscription);
					subscriptionsLookup[subscription.channelId] = subscription;
					
					
					SubscriptionService.getSubscriptionData(subscription, function(h, p){
						subscription.history = h;
						subscription.pinPriority = p;
						
						insertSubscriptionAndSort(subscription, t.subscriptions);
						console.log("insert sub", subscription.title);
						
					});
				
				}// else nothing, stored subs should be enough
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
	
	
	insertSubscriptionAndSort = function(s, array){
		$scope.$apply(function(){
			array.unshift(s);
		});
		
	}
	
	/*
	
	// returns:
	//		-1:	s1 comes before s2
	//		 0:	s1 equals s2
	//		+1:	s2 comes before s1
	compareSubscriptionByPinPriority = function(s1, s2){
		// pinning priority: greater pinPriority comes first
		if(s1.getPinPriority() > s2.getPinPriority()) return -1; // if s1 has greater pinning priority than s2, then s1 come first
		if(s2.getPinPriority() > s1.getPinPriority()) return +1; // if s2 has greater pinning priority than s1, then s2 come first
		
		return s1.title.localeCompare(s2.title);
	}
	*/
	
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
}]);


