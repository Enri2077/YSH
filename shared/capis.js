"use strict";

function ChromeApis() {};


/**
  *		Chrome.identity and authorization token.
  *		From: https://github.com/GoogleChrome/chrome-app-samples/blob/master/samples/gdrive/js/gdocs.js
  */

ChromeApis.prototype.auth = function(interactive, onSuccessCallback, onErrorCallback){
	try{
		chrome.identity.getAuthToken({interactive: interactive}, function(token){
			var err = chrome.runtime.lastError;
			
			if(err){
				onErrorCallback && onErrorCallback(err);
				return;
			}
			if(token){
				this.authToken = token;
				onSuccessCallback && onSuccessCallback();
			}else{
				onErrorCallback && onErrorCallback();
				return;
			}
		}.bind(this));
	}catch(e){
		console.log(e);
	}
};

ChromeApis.prototype.removeCachedAuthToken = function(opt_callback){
	if(this.authToken){
		var authToken = this.authToken;
		this.authToken = null;
		// Remove token from the token cache.
		chrome.identity.removeCachedAuthToken({ 
			token: authToken
		}, function(){
			opt_callback && opt_callback();
		});
	}else{
		opt_callback && opt_callback();
	}
};

ChromeApis.prototype.revokeAuthToken = function(tokenRevokedCallback, tokenNotRevokedCallback){
	if(this.authToken){
		// Make a request to revoke token
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + this.authToken);
		xhr.send();
		this.removeCachedAuthToken(tokenRevokedCallback);
	}else{
		tokenNotRevokedCallback && tokenNotRevokedCallback();
	};
};



/**
  *		Chrome.storage
  *		
  */

ChromeApis.prototype.getBytesInUse = function(callback){
	chrome.storage.local.getBytesInUse(callback);
};

ChromeApis.prototype.setOptions = function(options, callback){
	chrome.storage.local.set({'options': options}, callback);
};
ChromeApis.prototype.getOptions = function(callback){
	chrome.storage.local.get({'options': defaultOptions}, function(storage){ callback(storage.options); });
};





ChromeApis.prototype.wipeSubscriptionsState = function(callback){
	chrome.storage.local.remove('subscriptions',function(){
		console.log("SUBSCRIPTIONS STATE STORAGE WIPED");
		console.log("errors: ", chrome.runtime.lastError);
		if(callback) callback();
	});
};

ChromeApis.prototype.wipeHistory = function(callback){
	chrome.storage.local.remove('history',function(){
		console.log("HISTORY STORAGE WIPED");
		console.log("errors: ", chrome.runtime.lastError);
		if(callback) callback();
	});
};

ChromeApis.prototype.wipeStorage = function(callback){
	chrome.storage.local.clear(function(){
		console.log("STORAGE WIPED");
		console.log("errors: ", chrome.runtime.lastError);
		if(callback) callback();
	});
};


