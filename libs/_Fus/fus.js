/**
 * Fus <https://github.com/JWhile/Fus>
 *
 * version 1.0.0
 */

var fus = (function(){

var equal = function(obj1, obj2)
{
	if(typeof obj1 !== 'object' || typeof obj2 !== 'object')
		return (obj1 === obj2);
	if(Object.keys(obj1).length !== Object.keys(obj2).length)
		return false;
	for(var key in obj1)
	{
		if(obj1.hasOwnProperty(key) && (!obj2.hasOwnProperty(key) || !equal(obj1[key], obj2[key])))
			return false;
	}
	return true;
};

var clone = function(obj, recursive)
{
	if(typeof obj !== 'object' || obj == null)
		return null;
	var newObj = new obj.constructor();
	for(var key in obj)
	{
		if(obj.hasOwnProperty(key))
			newObj[key] = recursive? clone(obj[key], true) : obj[key];
	}
	return newObj;
};

var extend = function(klass, parent)
{
	for(var key in parent.prototype)
	{
		if(!klass.prototype.hasOwnProperty(key) && parent.prototype.hasOwnProperty(key))
			klass.prototype[key] = parent.prototype[key];
	}
	klass.prototype.constructor = klass;
	klass.super = function(self)
	{
		parent.apply(self, arguments.slice(1));
	};
	klass._super = parent;
	klass.__super = null;
	klass.prototype.super = function()
	{
		if(this.constructor.__super === null)
			this.constructor.__super = this.constructor._super;
		var sup = this.constructor.__super;
		this.constructor.__super = sup._super || null;
		sup.apply(this, arguments);
		return this;
	};
};

return {
	'equal': equal,
	'clone': clone,
	'extend': extend
};

})();

if(typeof module !== 'undefined' && module.exports)
	module.exports = fus;
