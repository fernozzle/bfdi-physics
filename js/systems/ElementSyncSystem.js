function ElementSyncSystem(stage, scale) {
	var _nodes;
	var _stage = stage;
	var _scale = scale;

	// System Functions
	this.setup = function(game) {
		_nodes = game.getNodeList(ElementSyncNode);
		for(var i = 0; i < _nodes.length(); i++) {
			_addToDisplay(_nodes.at(i));
		}

		_nodes.addSubscriber('nodeAdded', _addToDisplay);
		_nodes.addSubscriber('nodeRemoved', _removeFromDisplay);
	}

	this.update = function(time) {
		for(var i = 0; i < _nodes.length(); i++) {
			var node = _nodes.at(i);

			var position       = node.transform.position;
			var rotation       = node.transform.rotation;
			var transformString =
				'translate3d(' +
					(position[0] * scale) + 'px,' +
					(position[1] * scale) + 'px,0)' +
				'rotate(' + (degreesPerRadian * rotation) + 'deg)';

			var displayElement = node.displayElement.element;
			displayElement.style.webkitTransform = transformString;
			displayElement.style.mozTransform    = transformString;
			displayElement.style.transform       = transformString;
		}
	}

	this.detach = function(game) {
		_nodes.removeSubscriber('nodeAdded', _addToDisplay);
		_nodes.removeSubscriber('nodeRemoved', _removeFromDisplay);
		_nodes = null;
	}

	// Private Functions
	var _addToDisplay = function(elementSyncNode) {
		_stage.appendChild(elementSyncNode.displayElement.element);
	}

	var _removeFromDisplay = function(elementSyncNode) {
		_stage.removeChild(elementSyncNode.displayElement.element);
	}
}
ElementSyncSystem.prototype = new ash.System();
