// Not the best name. This module calls `getAnimationFrame` and handles
// events such as visibility changes.

var Animator = function() {
	this._wasHidden = false;
	var that = this;
	document.addEventListener(Animator.changeIdentifier, function() {
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
	Animator.changeIdentifier = 'visibilitychange';
} else if (typeof document.mozHidden !== 'undefined') {
	Animator.hiddenIdentifier = 'mozHidden';
	Animator.changeIdentifier = 'mozvisibilitychange';
} else if (typeof document.msHidden !== 'undefined') {
	Animator.hiddenIdentifier = 'msHidden';
	Animator.changeIdentifier = 'msvisibilitychange';
} else if (typeof document.webkitHidden !== 'undefined') {
	Animator.hiddenIdentifier = 'webkitHidden';
	Animator.changeIdentifier = 'webkitvisibilitychange';
}

Animator.prototype.start = function(callback) {
	this._callback = callback;
	var that = this;
	this._animate = function() {
		var currentTime = Date.now();
		var delta = (currentTime - that._previousTime) / 1000;

		if (!document[Animator.hiddenIdentifier] && delta > 0) {
			// If previously hidden, wait a frame in order to
			// record a more reasonable time delta
			if (that._wasHidden) {
				that._wasHidden = false;
			} else {
				that._callback(Math.min(delta, config.maxTimestep), delta);
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
