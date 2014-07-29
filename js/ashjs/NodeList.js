// namespace
this.ash = this.ash||{};

(function() {

function NodeList() {
  // Private Properties
  var _list = new Array();
  var _signals = {
    nodeAdded: new ash.Signal(),
    nodeRemoved: new ash.Signal()
  };

  // Public Functions
  this.add = function(node) {
    _list.push(node);
    _signals['nodeAdded'].dispatch(node);
  }
  
  this.remove = function(node) {
    var index = _list.indexOf(node);
    if( index != -1 ) {
      _list.splice(index, 1);
      _signals['nodeRemoved'].dispatch(node);
    }
  }

  this.removeAll = function() {
    while( _list.length ) {
      var node = _list[0];
      this.remove(node);
      signals['nodeRemoved'].dispatch(node);
    }
  }

  this.at = function(index) {
    return _list[index];
  }

  this.contains = function(entity) {
    return _list.indexOf(entity != -1);
  }

  this.length = function() {
    return _list.length;
  }

  this.empty = function() {
    return _list.length == 0;
  }

   this.addSubscriber = function(signalType, response) {
    if( !signalType in _signals ) {
      return false;
    }

    _signals[signalType].addSubscriber(response);
    return true;
  }

  this.removeSubscriber = function(signalType, response) {
    if( !signalType in _signals ) {
      return false;
    }

    _signals[signalType].removeSubscriber(response);
    return true; 
  }

  // <!> Didn't implement swap. Seems node list sorting would best be done through JS array sort method. </!>
}

ash.NodeList = NodeList;
}());