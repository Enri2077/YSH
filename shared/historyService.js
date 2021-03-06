"use strict";

function historyService(Video){
	var historyWriteLock		= false;
	var historyEntryQueue		= new Array();
	
	this.getHistory = function(callback){
		chrome.storage.local.get('history', function(storage){
			callback( storage.history || new Object() );
		});
	};
	
	this.restoreHistoryEntry = function(entry){
		// TODO find solution to generalize the write lock
	};
	
	this.storeHistoryEntries = function(entries, callback){
		var s = this;
		
		if(historyWriteLock){
			historyEntryQueue = historyEntryQueue.concat(entries);
			if(callback) callback();
			return;
		}
		historyWriteLock = true;
		
		chrome.storage.local.get('history', function(storage){
			if(!storage.history){
				console.log("storeHistoryEntries: history not defined; assigning new object");
				storage.history = new Object();
			}
			
			entries.forEach(function(entry){
				if(!storage.history[entry.channelId]){
					console.log("storeHistoryEntries: subscription not in history; assigning new object");
					storage.history[entry.channelId] = new Array();
				}
				
				storage.history[entry.channelId].push(entry);
			});
			
			chrome.storage.local.set(storage, function(){
				if(historyEntryQueue.length){
					
					var tmpHistoryEntryQueue = historyEntryQueue;
					historyEntryQueue = new Array();
					
					historyWriteLock = false;
					
					s.storeHistoryEntries(tmpHistoryEntryQueue, callback);
					
				}else{
					historyWriteLock = false;
					if(callback) callback();
				}
			});
			
		});
	};
	
}
