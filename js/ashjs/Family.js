// namespace:
this.ash = this.ash||{};

(function() {

function Family(nodeClass, game) {
  // Private Properties
  var _nodes = new ash.NodeList();
  var _entityNodeMap = Object.create(null);
  var _components = Object.create(null);
  // <!> Not implementing the Node pool. Could improve performance. </!>
  var _nodeClass = nodeClass;
  var _game = game;

  // Set up dummy node to establish components list
  var _dummyNode = new _nodeClass();
  for( var componentName in _dummyNode ) {
    _components[ _dummyNode[componentName].constructor ] = componentName;
  }

  // Public Functions
  this.getNodeList = function() {
    return _nodes;
  }

  this.checkEntityAdd = function(entity) { 
    return _addIfMatch(entity);
  }

  this.checkEntityRemove = function(entity) {
    return _removeIfMatch(entity);
  }

  this.checkNewComponent = function(entity, componentType) {
    if( !componentType in _components ) {
      return false;
    } // <!> Component type check added in port.
    return _addIfMatch(entity);
  }

  this.checkRemovedComponent = function(entity, componentType) { 
    if( componentType in _components ) {
      return _removeIfMatch(entity);
    }
  }

  // <?> Not positive this is even needed in JS </?>
  this.cleanUp = function() {
    for( var i = 0; i < _nodes.length(); i++ ) {
      delete _entityNodeMap[ _nodes.at(i).entity.id ];
    }

    _nodes.removeAll();
  }

  // Private Functions
  var _addIfMatch = function(entity) {
    if( entity.id in _entityNodeMap ) {
      return;
    }

    for( var componentType in _components ) {
      if( !entity.has(componentType) ) {
        return;
      }
    }

    // Entity is new and its components match the node
    var node = new ash.Node();
    node.entity = entity;
    for( var componentType in _components ) {
      node[ _components[componentType] ] = entity.get(componentType);
    }
    _entityNodeMap[entity.id] = node;
    _nodes.add(node);
  }

  var _removeIfMatch = function(entity) {
    if( !entity.id in _entityNodeMap ) {
      // Nothing to remove
      return; 
    }

    var node = _entityNodeMap[entity.id];
    delete _entityNodeMap[entity.id];
    _nodes.remove(node);
  }
}

ash.Family = Family;
}());