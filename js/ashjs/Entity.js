// namespace:
this.ash = this.ash||{};

(function() {

function Entity() {
  // Public Properties
  this.name = new String();
  this.id;

  // Private Properties 
  var components = new Object();
  var signals = {
    componentAdded: new ash.Signal(),
    componentRemoved: new ash.Signal()
  };

  this.add = function(component) {
    var componentType = component.constructor;
    
    if( typeof components[componentType] !== "undefined" ) {
      this.remove(componentType);
    }

    components[componentType] = component;
    signals.componentAdded.dispatch(this, componentType);
    return this;
  }

  this.remove = function(componentType) {
    var component = components[componentType];
    if( typeof component !== "undefined" ) {
      delete components[componentType];
      signals.componentRemoved.dispatch(this, componentType);
      return component;
    }
  }

  this.get = function(componentType) {
    return components[componentType];
  }

  // Returns an array of all of this entity's components
  this.getAll = function() {
    var componentArray = new Array();
    for( var type in components ) {
      componentArray.push(components[type]);
    }
    return componentArray;
  }

  this.has = function(componentType) {
    return typeof components[componentType] !== "undefined";
  }

  // <!> Clone does NOT copy id. It should be undefined in the clone until added to the game, which manages unique id's </!>
  this.clone = function() {
    var copy = new Entity();
    for( var component in components ) {
      var newComponent = new component.constructor;
      for( var property in component ) {
        newComponent[property] = component[property];
      }
      copy.add(newComponent);
    }
    return copy;
  }

  this.addSubscriber = function(signalType, response) {
    if( typeof signals[signalType] === "undefined" ) {
      return false;
    }

    signals[signalType].addSubscriber(response);
    return true;
  }

  this.removeSubscriber = function(signalType, response) {
    if( typeof signals[signalType] === "undefined" ) {
      return false;
    }

    signals[signalType].removeSubscriber(response);
    return true; 
  }
}

ash.Entity = Entity;
}());