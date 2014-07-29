// namespace:
this.ash = this.ash||{};

(function() {

function Game() {
  // Private Properties 
  var entityList = new ash.EntityList();
  var systemList = new ash.SystemList();
  var families = new Object();
  var _updateComplete = new ash.Signal(); 
  var nextId = 0;
  // <!> Id's are unique to this JS port. Each entity holds a unique id managed by the game object to allow easy lookup operations.

  // Public Properties
  this.updating = false;

  // <!> Component matching family is exposed in AS3 implementation, but I'm planning to bake it into family class.

  // Private Functions
  var componentAdded = function(entity, componentType) {  
    for( var type in families ) {
      families[type].checkNewComponent(entity, componentType);
    }
  }

  var componentRemoved = function(entity, componentType) { 
    for( var type in families ) {
      families[type].checkRemovedComponent(entity, componentType);
    }
  } 

  // Public Functions
  this.addEntity = function(entity) { 
    entity.id = nextId;
    nextId++;

    entityList.add(entity);
    entity.addSubscriber("componentAdded", componentAdded);
    entity.addSubscriber("componentRemoved", componentRemoved);
    for( var type in families ) {
      families[type].checkEntityAdd(entity);
    }
  }

  this.removeEntity = function(entity) { 
    entity.removeSubscriber("componentAdded", componentAdded);
    entity.removeSubscriber("componentRemoved", componentRemoved);
    for( var type in families ) {
      families[type].checkEntityRemove(entity, "remove");
    }
    entityList.remove(entity);
  }

  this.removeAllEntities = function() {
    while( entityList.length() ) {
      removeEntity(entityList.at(0));
    }
  }

  this.getNodeList = function(nodeConstructor) {
    if( nodeConstructor in families ) {
      return families[nodeConstructor].getNodeList();
    }
    // implied else
    var family = new ash.Family(nodeConstructor, this);
    families[nodeConstructor] = family;
    for( var i = 0; i < entityList.length(); i++ ) {
      family.checkEntityAdd( entityList.at(i) );
    }
    return family.getNodeList();
  }

  this.releaseNodeList = function(nodeType) { 
    if( typeof families[nodeType] !== "undefined" ) {
      families[nodeType].cleanUp();
      delete families[nodeType];  
    }
  }

  this.addSystem = function(system, priority) { 
    system.priority = priority;
    system.setup(this);
    systemList.add(system);
  }

  this.getSystem = function(systemType) { 
    return systemList.get(systemType);
  }

  this.removeSystem = function(system) { 
    systemList.remove(system);
    system.detach(this);
  }

  this.removeAllSystems = function() { 
    while( systemList.length() ) {
      removeSystem(systemList.at(0));
    }
  }
  // <?> AS3 implements an entities() and systems() getter that returns a copy of the entityList. Not sure if it's needed... </?>
  
  this.update = function(time) { 
    this.updating = true;
    for( var i = 0; i < systemList.length(); i++ ) {
      systemList.at(i).update(time);
    }
    this.updating = false;
    _updateComplete.dispatch();
  }
}

ash.Game = Game;
}());