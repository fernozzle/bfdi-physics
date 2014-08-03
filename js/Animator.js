// Not the best name. This module calls `getAnimationFrame` and handles
// events such as visibility changes.

var Animator = function() {
	this._wasHidden = false;
	var that = this;
	document.addEventListener(Animator.visibilityChangeIdentifier, function() {
		// Only enable `_wasHidden`: it must be disabled
		// after one non-hidden frame
		if (document[Animator.hiddenIdentifier]) {
			that._wasHidden = true;
		}
	}, false);
}

Animator.requestAnimationFrame = (
	window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function(callback, element) {
		window.setTimeout(callback, 1000 / 60);
	}
);
if (typeof document.hidden !== 'undefined') {
	Animator.hiddenIdentifier = 'hidden';
	Animator.visibilityChangeIdentifier = 'visibilitychange';
} else if (typeof document.mozHidden !== 'undefined') {
	Animator.hiddenIdentifier = 'mozHidden';
	Animator.visibilityChangeIdentifier = 'mozvisibilitychange';
} else if (typeof document.msHidden !== 'undefined') {
	Animator.hiddenIdentifier = 'msHidden';
	Animator.visibilityChangeIdentifier = 'msvisibilitychange';
} else if (typeof document.webkitHidden !== 'undefined') {
	Animator.hiddenIdentifier = 'webkitHidden';
	Animator.visibilityChangeIdentifier = 'webkitvisibilitychange';
}

Animator.prototype.start = function(callback) {
	this._callback = callback;
	var that = this;
	this._animate = function() {
		var currentTime = Date.now();
		var delta = currentTime - that._previousTime;

		if (!document[Animator.hiddenIdentifier]) {
			// If previously hidden, wait a frame in order to
			// record a more reasonable time delta
			if (that._wasHidden) {
				that._wasHidden = false;
			} else {
				that._callback(delta / 1000);
			}
		}
		that._previousTime = currentTime;
		that._request();
	}
	this._request();
}
Animator.prototype._request = function() {
	Animator.requestAnimationFrame.call(window, this._animate);
}
