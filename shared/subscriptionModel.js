"use strict";

function modelSubscription(){
	
	function Subscription(title, channelId, thumbnails, etag, uploadPlaylistId, pinPriority, history, uploads, lastUploadDate, nextPageToken){
		this.title				= title;
		this.channelId 			= channelId;
		this.thumbnails 		= thumbnails;
		this.etag 				= etag;
		this.uploadPlaylistId	= uploadPlaylistId
		this.pinPriority 		= pinPriority;
		this.history 			= history;
		this.uploads 			= uploads;
		this.lastUploadDate		= lastUploadDate;
		this.nextPageToken		= nextPageToken;
	};
	
	Subscription.apiResponseTransformer = function(youtubeApiResponse){
		return new Subscription(
			youtubeApiResponse.snippet.title,
			youtubeApiResponse.snippet.resourceId.channelId,
			youtubeApiResponse.snippet.thumbnails,
			youtubeApiResponse.etag
		);
	};
	
	Subscription.fromStorageObject = function(storageObject, pinPriority, history, uploads){
		var uploadPlaylistId = null; //TODO
		return new Subscription(
			storageObject.title,
			storageObject.channelId,
			storageObject.thumbnails,
			storageObject.etag,
			uploadPlaylistId,
			pinPriority,
			history,
			uploads,
			storageObject.lastUploadDate,
			storageObject.nextPageToken
		);
	};
	
	Subscription.prototype.toStorageObject = function(){
		if(this.pinPriority > 0) return {
			title: 			this.title,
			channelId:		this.channelId,
			thumbnails:		this.thumbnails,
			etag:			this.etag,
			uploads:		this.uploads,
			lastUploadDate:	this.lastUploadDate
		}
		else return {
			title: 			this.title,
			channelId:		this.channelId,
			thumbnails:		this.thumbnails
		}
	};
	
	Subscription.prototype.updateInfo = function(youtubeApiResponse){
		this.title			= youtubeApiResponse.snippet.title;
		this.thumbnails 	= youtubeApiResponse.snippet.thumbnails;
	};
	
	
	Subscription.prototype.getPinPriority = function(){
		return (this.pinPriority != null ? this.pinPriority : 0 );
	};
	
	
	Subscription.prototype.isFavorited = function(){
		return this.getPinPriority() == 1;
		
	};
	Subscription.prototype.toggleFavorited = function(){
		if(this.getPinPriority()==1) this.pinPriority = 0;		// if it was favorited already, then it's not now
		else this.pinPriority = 1;								// if it was not favorited already, then it's now
	};
	
	
	Subscription.prototype.isLoved = function(){
		return this.getPinPriority() == 2;
		
	};
	Subscription.prototype.toggleLoved = function(){
		if(this.getPinPriority()==2) this.pinPriority = 0;		// if it was loved already, then it's not now
		else this.pinPriority = 2;								// if it was not loved already, then it's now
	};
	
	
	
	Subscription.prototype.hasFeedInHistory = function(feed){
		if(!this.history) return false;
		
		for (var i = this.history.length-1; i >= 0 ; i--) {
			if (this.history[i].videoId === feed.contentDetails.upload.videoId) {
				return true;
			}
		}
		return false;
	};
	
	Subscription.prototype.addToHistory = function(historyEntry){
		if(!this.history) this.history = new Array();
		this.history.push(historyEntry);
	};
	
	Subscription.prototype.setHistory = function(historyEntries){
		this.history = historyEntries;
	};
	
	
	
	Subscription.prototype.hasUploads = function(){
		return this.uploads && this.uploads.length;
	};
	
	Subscription.prototype.hasFeedInUploads = function(feed){
		if(!this.uploads) return false;
		
		for (var i = this.uploads.length-1; i >= 0 ; i--) {
			if (this.uploads[i].videoId === feed.contentDetails.upload.videoId) {
				return true;
			}
		}
		return false;
	};
	
	Subscription.prototype.pushUpload = function(upload){
		if(!this.uploads) this.uploads = new Array();
		this.uploads.push(upload);
	};
	
	Subscription.prototype.removeUpload = function(upload){
		if(this.hasUploads()){
			var i = this.uploads.indexOf(upload);
			if(i != -1) this.uploads.splice(i, 1);
		}
	};
	
	Subscription.prototype.resetUploads = function(){
		this.uploads = new Array();
	};
	
	Subscription.prototype.updateLastUploadDate = function(){
		if(this.hasUploads()) this.lastUploadDate = this.uploads[0].publishedAt;
		else this.lastUploadDate = null;
	};
	
	Subscription.prototype.sortUploads = function(){
		if(this.hasUploads()) this.uploads.sort(compareUploadByUploadDate);
	};
	
	
	// TODO find apropriate place for compareUploadByUploadDate
	var compareUploadByUploadDate = function(u1, u2){
		return u2.publishedAt.localeCompare(u1.publishedAt);
	};
	
	//TODO Subscription.prototype.compareSubscriptionByLastUploadDate;
	
	return Subscription;
}
