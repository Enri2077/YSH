
angular.module('app').controller('NewSubscriptionController', function(cApis, Video, Subscription, $http, $scope, $interval){
	var t = this;
	
	var isInitialised = false;
	var subscriptionsLookup	= new Object();
	
	this.subscriptions = new Array();
	
	var signIn = function(silent){
		cApis.auth(!silent, function(){ // asynchronous callback on token recevied
			$http.defaults.headers.common.Authorization = 'Bearer ' + cApis.authToken;
			
			if(gapi.client && !isInitialised ) isInitialised = true;
			else {
				console.log("gapi.client NOT LOADED", gapi.client);
				return;
			}
			
			console.log("gapi.client loaded", gapi.client);
			
			gapi.client.setApiKey("AIzaSyCGQi6WwvIhr62iyFcdg_b0PKOSUbb4mKw");
			gapi.auth.setToken({'access_token': cApis.authToken});
			gapi.client.load('youtube', 'v3', function() {
			console.log("gapi.client.youtube loaded", gapi.client);
				$scope.$apply(function(){
					requestUserSubscriptions();
				});
			});
			
		}, function(error){
			if(error.message == "The user is not signed in."){}
			if(error.message == "OAuth2 not granted or revoked."){}
			if(error.message == "The user did not approve access."){}
			console.log("auth:", error.message);
		});
	};
	chrome.identity.onSignInChanged.addListener(signIn);
	this.signIn = signIn;
	
	$scope.initSubs = function(){
		//console.log("trying to initialise subscriptions");
		if(isInitialised){
			return;
		}else{
			signIn(true);
		}
	}
	
	this.isSignedIn = function(){
		return isInitialised;
	}
	
	function timeoutSubscriptionRequestCallback(s){
		console.log("timeoutSubscriptionRequestCallback");
		return function(){
			console.log("anonimous:", s.title);
			requestUploadsPlaylistId(s);
		}
	}

	function requestUserSubscriptions(pageToken) {
		var request = gapi.client.youtube.subscriptions.list({
			mine:		true,
			part:		'snippet',
			maxResults:	50,
			pageToken:	pageToken || ""
		});
		request.execute(function(response) {
			console.log(response);
			if(response.nextPageToken){
				requestUserSubscriptions(response.nextPageToken);
			}
			var subscriptions = response.result.items;
			
			//TODO subscriptions.sort(Subscription.compareUploadByUploadDate);
			
			subscriptions.forEach(function(responseSubscription, i) {
				var subscription = Subscription.apiResponseTransformer(responseSubscription);
				subscriptionsLookup[subscription.channelId] = subscription;
				
				subscription.pinPriority = 2;
				
				setTimeout(timeoutSubscriptionRequestCallback(subscription), i*1000)
			//	requestUploadsPlaylistId(subscription);
				
			});
			console.log(subscriptionsLookup);
		});
	}

	function requestUploadsPlaylistId(subscription) {
		var request = gapi.client.youtube.channels.list({
			id: subscription.channelId,
			part: 'contentDetails',
			maxResults: 50
		});
		request.execute(function(response) {
			subscription.uploadPlaylistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
			requestVideoPlaylist(subscription);
		});
	}

	// Retrieve the list of videos in the specified playlist.
	function requestVideoPlaylist(subscription, pageToken) {
		var requestOptions = {
			playlistId: subscription.uploadPlaylistId,
			part: 'snippet',
			maxResults: 50
		};
		if (pageToken) {
			requestOptions.pageToken = pageToken;
		}
		
		
		
		var request = gapi.client.youtube.playlistItems.list(requestOptions);
		request.execute(function(response) {
		
			console.log("requestVideoPlaylist:", response);
		
			nextPageToken = response.result.nextPageToken;
			prevPageToken = response.result.prevPageToken

			var playlistItems = response.result.items;
			if (playlistItems) {
				
				for(var i = 0; i < playlistItems.length; i++){
					var video = Video.apiActivityResponseTransformer(playlistItems[i]);
					var one_month_ago = new Date((new Date())-30*86400*1000);
					
					if((new Date(video.publishedAt)) > one_month_ago){
						subscription.pushUpload(video);
						// TODO: do not request other pages
					}
				}
				
		//		playlistItems.forEach(function(playlistItem, index) {
		//			var video = Video.apiActivityResponseTransformer(playlistItem);
		//			
		//			subscription.pushUpload(Video.apiActivityResponseTransformer(playlistItem));
		//		});
				
				subscription.sortUploads();
				subscription.updateLastUploadDate();
				
				$scope.$apply(function(){
					t.subscriptions = Object.keys(subscriptionsLookup).map(key => subscriptionsLookup[key]);
					//console.log(t.subscriptions.length+0);
				});
			}
		});
	}
	
	
	
	this.update = function(){
		//signIn(true);
		requestUserSubscriptions();
	};
	$scope.update = this.update;
	
	this.updateFeeds = function(subscription){
	};
	
	this.isSubscriptionFavorited = function(subscription){
		return false;
	};
	this.setFavoriteSubscription = function(subscription){
	};
	this.isSubscriptionLoved = function(subscription){
		return false;
	};
	this.setLoveSubscription = function(subscription){
	};
	
	this.addToHistory = function(upload, subscription, hidden){
	};
	
	this.addAllToHistory = function(subscription){
	};
	
	
});

