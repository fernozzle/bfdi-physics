var StateManager = (function() {
	var keyMap = new TwoWayMap({
		'p': 'props',
		'n': 'name',
		'b': 'bodies',
		'p': 'position',
		'r': 'rotation',
		'v': 'velocity',
		'a': 'angularVelocity'
	});
	function renameKeys(object, mapFunction) {
		// Array
		if (Object.prototype.toString.call(object) === '[object Array]') {
			return object.map(function(element) {
				return renameKeys(element, mapFunction);
			});
		}
		// Object
		if (Object.prototype.toString.call(object) === '[object Object]') {
			var result = {};
			for (var origKey in object) {
				var newKey = mapFunction(origKey) || origKey;
				result[newKey] = renameKeys(object[origKey], mapFunction);
			}
			return result;
		}
		// Other
		return object;
	}
	return {
		serializeState: function(state) {
			var stateShortKeys = renameKeys(state, keyMap.revGet.bind(keyMap));
			return msgpack.pack(stateShortKeys, true);
		},
		deserializeState: function(data) {
			var stateShortKeys = msgpack.unpack(data);
			return renameKeys(state, keyMap.get.bind(keyMap));
		}
	};
})();
