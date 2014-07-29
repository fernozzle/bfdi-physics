// namespace
this.ash = this.ash||{};

(function() {

function SystemList() {
  // Private Properties
  var list = new Array();

  // Public Functions
  this.add = function(system) {
    for( var i in list ) {
      if( list[i].priority > system.priority ) {
        list.splice(i, 0, system);
        return;
      }
    }
    list.push(system);
  }
  
  this.remove = function(system) {
    var index = list.indexOf(system);
    if( index != -1 ) {
      list.splice(index, 1);
    }
  }

  this.removeAll = function() {
    list = [];
  }

  this.get = function(type) {
    for( var i in list ) {
      if( list[i] instanceof type ) {
        return list[i];
      }
    }
  }

  this.at = function(index) {
    return list[index];
  }

  this.length = function() {
    return list.length;
  }
}

ash.SystemList = SystemList;
}());