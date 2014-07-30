// namespace:
this.ash = this.ash||{};

(function() {

function Signal() {
  // Private Properties
  var _subscribers = new Array();

  this.addSubscriber = function(func) {
    _subscribers.push(func);
  }

  this.removeSubscriber = function(func) {
    var index = _subscribers.indexOf(func);
    if( index != -1 ) {
      _subscribers.splice(index, 1);
    }
  }

  this.dispatch = function() {
    for( var i in _subscribers ) {
      _subscribers[i].apply(this, arguments);
    }
  }
}

ash.Signal = Signal;
}());