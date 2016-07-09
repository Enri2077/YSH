"use strict";

function modelVideo(){
	
	function Video(title, videoId, channelId, thumbnails, publishedAt, hidden, date){
		this.title			= title;
		this.videoId		= videoId;
		this.channelId 		= channelId;
		this.thumbnails 	= thumbnails;
		this.publishedAt	= publishedAt;
		this.hidden			= hidden;
		this.date			= date;
	}
	
	Video.apiActivityResponseTransformer = function(youtubeApiResponse){
		if(youtubeApiResponse.kind === "youtube#playlistItem"){
			return new Video(
				youtubeApiResponse.snippet.title,
				youtubeApiResponse.snippet.resourceId.videoId,
				youtubeApiResponse.snippet.channelId,
				youtubeApiResponse.snippet.thumbnails,
				youtubeApiResponse.snippet.publishedAt
			);
		}else{
			return new Video(
				youtubeApiResponse.snippet.title,
				youtubeApiResponse.contentDetails.upload.videoId,
				youtubeApiResponse.snippet.channelId,
				youtubeApiResponse.snippet.thumbnails,
				youtubeApiResponse.snippet.publishedAt
			);
		}
	};
	
	Video.fromStorageObject = function(storageObject){
		return new Video(
			storageObject.title,
			storageObject.videoId,
			storageObject.channelId,
			storageObject.thumbnails,
			storageObject.publishedAt
		);
	};
	
	Video.prototype.toHistoryObject = function(hidden, date){
		return {
			title: 			this.title,
			videoId: 		this.videoId,
			channelId: 		this.channelId,
			thumbnails:		this.thumbnails,
			publishedAt:	this.publishedAt,
			hidden:			hidden,
			date:			date.getTime()
		}
	};
	
	Video.fromHistoryObject = function(historyObject){
		return new Video(
			historyObject.title,
			historyObject.videoId,
			historyObject.channelId,
			historyObject.thumbnails,
			historyObject.publishedAt,
			historyObject.hidden,
			new Date(historyObject.date)
		);
	};
	
	Video.prototype.updateInfo = function(youtubeApiResponse){
		this.title			= youtubeApiResponse.snippet.title;
		this.thumbnails 	= youtubeApiResponse.snippet.thumbnails;
		this.publishedAt	= youtubeApiResponse.snippet.publishedAt;
		/*TODO*/
	};
	
	Video.prototype.getUrl = function(){
		return "https://www.youtube.com/watch?v="+this.videoId;
	};
	Video.prototype.getFullBrowserUrl = function(){
		return "https://www.youtube.com/v/"+this.videoId+"?autoplay=true";
	};
	
	Video.prototype.getChannelUrl = function(){
		return "https://www.youtube.com/channel/"+this.channelId;
	};
	
	Video.prototype.getHistoryDate = function(){
		return this.date;
	};
	
	Video.prototype.getReadableHistoryDate = function(){
		var d = this.date;
		return d.getFullYear()+"-"+(1+d.getMonth())+"-"+d.getDate()+" "+d.toTimeString()
	};
	
	Video.prototype.getReadablePublishedAt = function(){
		var d = new Date(this.publishedAt);
		return d.getFullYear()+"-"+(1+d.getMonth())+"-"+d.getDate()+" "+d.toTimeString();
	};
	
	/* TODO getters and setters */
	
	
	return Video;
}
