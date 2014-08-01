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
		if (object && typeof object === 'object' && object.length === undefined) {
			var replacement = {};
			for (var longKey in object) {
				var shortKey = mapFunction(longKey) || longKey;
				replacement[shortKey] = object[longKey];
			}
			return replacement;
		}
		return object;
	}
	return {
		serializeState: function(state) {
			return JSON.stringify(state, function (key, value) {
				return renameKeys(value, keyMap.revGet.bind(keyMap));
			});
		},
		deserializeState: function(jsonData) {
			return JSON.parse(jsonData, function (key, value) {
				return renameKeys(value, keyMap.get.bind(keyMap));
			});
		}
	};
})();
