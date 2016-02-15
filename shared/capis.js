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



ChromeApis.prototype.getDB = function(callback){
	chrome.storage.local.get(function(storage){ callback(storage); });
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




/**
  *		Chrome.fileSystem
  *		
  */




var savedFileEntry, fileDisplayPath;

ChromeApis.prototype.getDatabaseAsText = function(callback) {
	
	chrome.storage.local.get(function(storage){ callback(storage); }.bind(this));
	
	/*
	chrome.storage.local.get(dbName, function(storedData){
		var text = '';

		if ( storedData[dbName].todos ){
			storedData[dbName].todos.forEach(function(todo){
				text += '- ';
				if ( todo.completed ){
					text += '[DONE] ';
				}
			
				text += todo.title;
				text += '\n';
			}, '');
		}

		callback(text);

	}.bind(this));*/
}

ChromeApis.prototype.exportToFileEntry = function(fileEntry) {
	savedFileEntry = fileEntry;

	var status = document.getElementById('status');

	// Use this to get a file path appropriate for displaying
	chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
		fileDisplayPath = path;
		status.innerText = 'Exporting to '+path;
	});

	getDatabaseAsText( function(contents) {

		fileEntry.createWriter(function(fileWriter) {

			var truncated = false;
			var blob = new Blob([contents]);

			fileWriter.onwriteend = function(e) {
				if (!truncated) {
					truncated = true;
					// You need to explicitly set the file size to truncate
					// any content that might have been there before
					this.truncate(blob.size);
					return;
				}
				status.innerText = 'Export to '+fileDisplayPath+' completed';
			};

			fileWriter.onerror = function(e) {
				status.innerText = 'Export failed: '+e.toString();
			};

			fileWriter.write(blob);

		});
	});
}

ChromeApis.prototype.doExportToDisk = function(){
	if (savedFileEntry){
		exportToFileEntry(savedFileEntry);
	}else{
		chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: 'ysh_database_export.json', accepts: [ { description: 'json format (*.json)', extensions: ['json']} ], acceptsAllTypes: true }, exportToFileEntry);
	
	}
}

