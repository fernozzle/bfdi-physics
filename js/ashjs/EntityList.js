// namespace
this.ash = this.ash||{};

(function() {

function EntityList() {
  // Private Properties
  var _list = new Array();

  // Public Functions
  this.add = function(entity) {
    _list.push(entity);
  }
  
  this.remove = function(entity) {
    var index = _list.indexOf(entity);
    if( index != -1 ) {
      _list.splice(index, 1);
    }
  }

  this.removeAll = function() {
    _list = [];
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
}

ash.EntityList = EntityList;
}());