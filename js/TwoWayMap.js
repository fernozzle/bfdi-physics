function TwoWayMap(map){
	 this.map = map;
	 this.reverseMap = {};
	 for(var key in map){
		var value = map[key];
		this.reverseMap[value] = key;	 
	 }
}
TwoWayMap.prototype.get = function(key){ return this.map[key]; };
TwoWayMap.prototype.revGet = function(key){ return this.reverseMap[key]; };
