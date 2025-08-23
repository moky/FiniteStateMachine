/**
 * JavaScript Library (v2.0.0)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Aug. 20, 2025
 * @copyright (c) 2020-2025 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof MONKEY !== 'object') {
    MONKEY = {}
}
(function (mk) {
    if (typeof mk.type !== 'object') {
        mk.type = {}
    }
    if (typeof mk.format !== 'object') {
        mk.format = {}
    }
    if (typeof mk.digest !== 'object') {
        mk.digest = {}
    }
    if (typeof mk.protocol !== 'object') {
        mk.protocol = {}
    }
    if (typeof mk.ext !== 'object') {
        mk.ext = {}
    }
    mk.type.Class = function (child, parent, interfaces, methods) {
        if (!child) {
            child = function () {
                Object.call(this)
            }
        }
        if (parent) {
            child._mk_super_class = parent
        } else {
            parent = Object
        }
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        if (interfaces) {
            child._mk_interfaces = interfaces
        }
        if (methods) {
            override_methods(child, methods)
        }
        return child
    };
    var Class = mk.type.Class;
    var override_methods = function (clazz, methods) {
        var names = Object.keys(methods);
        var key, fn;
        for (var i = 0; i < names.length; ++i) {
            key = names[i];
            fn = methods[key];
            if (typeof fn === 'function') {
                clazz.prototype[key] = fn
            }
        }
    };
    mk.type.Interface = function (child, parents) {
        if (!child) {
            child = function () {
            }
        }
        if (parents) {
            child._mk_super_interfaces = parents
        }
        return child
    };
    var Interface = mk.type.Interface;
    Interface.conforms = function (object, protocol) {
        if (!object) {
            return false
        } else if (object instanceof protocol) {
            return true
        }
        return check_extends(object.constructor, protocol)
    };
    var check_extends = function (constructor, protocol) {
        var interfaces = constructor._mk_interfaces;
        if (interfaces && check_implements(interfaces, protocol)) {
            return true
        }
        var parent = constructor._mk_super_class;
        return parent && check_extends(parent, protocol)
    };
    var check_implements = function (interfaces, protocol) {
        var child, parents;
        for (var i = 0; i < interfaces.length; ++i) {
            child = interfaces[i];
            if (child === protocol) {
                return true
            }
            parents = child._mk_super_interfaces;
            if (parents && check_implements(parents, protocol)) {
                return true
            }
        }
        return false
    };
    mk.type.Object = Interface(null, null);
    var IObject = mk.type.Object;
    IObject.prototype = {
        getClassName: function () {
        }, equals: function () {
        }, valueOf: function () {
        }, toString: function () {
        }
    };
    IObject.isNull = function (object) {
        if (typeof object === 'undefined') {
            return true
        } else {
            return object === null
        }
    };
    IObject.isString = function (object) {
        return typeof object === 'string'
    };
    IObject.isNumber = function (object) {
        return typeof object === 'number'
    };
    IObject.isBoolean = function (object) {
        return typeof object === 'boolean'
    };
    IObject.isFunction = function (object) {
        return typeof object === 'function'
    };
    IObject.isBaseType = function (object) {
        var t = typeof object;
        if (t === 'string' || t === 'number' || t === 'boolean' || t === 'function') {
            return true
        }
        if (object instanceof Date) {
            return true
        }
        if (object instanceof RegExp) {
            return true
        }
        return object instanceof Error
    };
    mk.type.BaseObject = function () {
        Object.call(this)
    };
    var BaseObject = mk.type.BaseObject;
    Class(BaseObject, null, [IObject], {
        getClassName: function () {
            return Object.getPrototypeOf(this).constructor.name
        }, equals: function (other) {
            return this === other
        }
    });
    mk.type.DataConverter = Interface(null, null);
    var DataConverter = mk.type.DataConverter;
    DataConverter.prototype = {
        getString: function (value, defaultValue) {
        }, getBoolean: function (value, defaultValue) {
        }, getInt: function (value, defaultValue) {
        }, getFloat: function (value, defaultValue) {
        }, getDateTime: function (value, defaultValue) {
        }
    };
    mk.type.BaseConverter = function () {
        BaseObject.call(this)
    };
    var BaseConverter = mk.type.BaseConverter;
    Class(BaseConverter, BaseObject, [DataConverter], {
        getDateTime: function (value, defaultValue) {
            if (IObject.isNull(value)) {
                return defaultValue
            } else if (value instanceof Date) {
                return value
            }
            var seconds = this.getFloat(value, 0);
            var millis = seconds * 1000;
            return new Date(millis)
        }, getFloat: function (value, defaultValue) {
            if (IObject.isNull(value)) {
                return defaultValue
            } else if (IObject.isNumber(value)) {
                return value
            } else if (IObject.isBoolean(value)) {
                return value ? 1.0 : 0.0
            }
            var text = this.getStr(value);
            return parseFloat(text)
        }, getInt: function (value, defaultValue) {
            if (IObject.isNull(value)) {
                return defaultValue
            } else if (IObject.isNumber(value)) {
                return value
            } else if (IObject.isBoolean(value)) {
                return value ? 1 : 0
            }
            var text = this.getStr(value);
            return parseInt(text)
        }, getBoolean: function (value, defaultValue) {
            if (IObject.isNull(value)) {
                return defaultValue
            } else if (IObject.isBoolean(value)) {
                return value
            } else if (IObject.isNumber(value)) {
                return value > 0 || value < 0
            }
            var text = this.getStr(value);
            text = text.trim();
            var size = text.length;
            if (size === 0) {
                return false
            } else if (size > Converter.MAX_BOOLEAN_LEN) {
                throw new TypeError('Boolean value error: "' + value + '"');
            } else {
                text = text.toLowerCase()
            }
            var state = Converter.BOOLEAN_STATES[text];
            if (IObject.isNull(state)) {
                throw new TypeError('Boolean value error: "' + value + '"');
            }
            return state
        }, getString: function (value, defaultValue) {
            if (IObject.isNull(value)) {
                return defaultValue
            } else if (IObject.isString(value)) {
                return value
            } else {
                return value.toString()
            }
        }, getStr: function (value) {
            if (IObject.isString(value)) {
                return value
            } else {
                return value.toString()
            }
        }
    });
    mk.type.Converter = {
        getString: function (value, defaultValue) {
            return this.converter.getString(value, defaultValue)
        },
        getBoolean: function (value, defaultValue) {
            return this.converter.getBoolean(value, defaultValue)
        },
        getInt: function (value, defaultValue) {
            return this.converter.getInt(value, defaultValue)
        },
        getFloat: function (value, defaultValue) {
            return this.converter.getFloat(value, defaultValue)
        },
        getDateTime: function (value, defaultValue) {
            return this.converter.getDateTime(value, defaultValue)
        },
        converter: new BaseConverter(),
        BOOLEAN_STATES: {
            '1': true,
            'yes': true,
            'true': true,
            'on': true,
            '0': false,
            'no': false,
            'false': false,
            'off': false,
            'null': false,
            'none': false,
            'undefined': false
        },
        MAX_BOOLEAN_LEN: 'undefined'.length
    };
    var Converter = mk.type.Converter;
    var is_array = function (obj) {
        return obj instanceof Array || is_number_array(obj)
    };
    var is_number_array = function (obj) {
        if (obj instanceof Uint8ClampedArray) {
            return true
        } else if (obj instanceof Uint8Array) {
            return true
        } else if (obj instanceof Int8Array) {
            return true
        } else if (obj instanceof Uint16Array) {
            return true
        } else if (obj instanceof Int16Array) {
            return true
        } else if (obj instanceof Uint32Array) {
            return true
        } else if (obj instanceof Int32Array) {
            return true
        } else if (obj instanceof Float32Array) {
            return true
        } else if (obj instanceof Float64Array) {
            return true
        }
        return false
    };
    var number_arrays_equal = function (array1, array2) {
        var pos = array1.length;
        if (pos !== array2.length) {
            return false
        }
        while (pos > 0) {
            pos -= 1;
            if (array1[pos] !== array2[pos]) {
                return false
            }
        }
        return true
    };
    var arrays_equal = function (array1, array2) {
        if (is_number_array(array1) || is_number_array(array2)) {
            return number_arrays_equal(array1, array2)
        }
        var pos = array1.length;
        if (pos !== array2.length) {
            return false
        }
        while (pos > 0) {
            pos -= 1;
            if (!objects_equal(array1[pos], array2[pos], false)) {
                return false
            }
        }
        return true
    };
    var maps_equal = function (dict1, dict2) {
        var keys1 = Object.keys(dict1);
        var keys2 = Object.keys(dict2);
        var pos = keys1.length;
        if (pos !== keys2.length) {
            return false
        }
        var key;
        while (pos > 0) {
            pos -= 1;
            key = keys1[pos];
            if (!key || key.length === 0) {
                continue
            }
            if (!objects_equal(dict1[key], dict2[key], key.charAt(0) === '_')) {
                return false
            }
        }
        return true
    };
    var objects_equal = function (obj1, obj2, shallow) {
        if (!obj1) {
            return !obj2
        } else if (!obj2) {
            return false
        } else if (obj1 === obj2) {
            return true
        }
        if (typeof obj1['equals'] === 'function') {
            return obj1.equals(obj2)
        } else if (typeof obj2['equals'] === 'function') {
            return obj2.equals(obj1)
        }
        if (is_array(obj1)) {
            return is_array(obj2) && arrays_equal(obj1, obj2)
        } else if (is_array(obj2)) {
            return false
        }
        if (obj1 instanceof Date) {
            return obj2 instanceof Date && obj1.getTime() === obj2.getTime()
        } else if (obj2 instanceof Date) {
            return false
        } else if (IObject.isBaseType(obj1)) {
            return false
        } else if (IObject.isBaseType(obj2)) {
            return false
        }
        return !shallow && maps_equal(obj1, obj2)
    };
    var copy_items = function (src, srcPos, dest, destPos, length) {
        if (srcPos !== 0 || length !== src.length) {
            src = src.subarray(srcPos, srcPos + length)
        }
        dest.set(src, destPos)
    };
    var insert_item = function (array, index, item) {
        if (index < 0) {
            index += array.length + 1;
            if (index < 0) {
                return false
            }
        }
        if (index === 0) {
            array.unshift(item)
        } else if (index === array.length) {
            array.push(item)
        } else if (index > array.length) {
            array[index] = item
        } else {
            array.splice(index, 0, item)
        }
        return true
    };
    var update_item = function (array, index, item) {
        if (index < 0) {
            index += array.length;
            if (index < 0) {
                return false
            }
        }
        array[index] = item;
        return true
    };
    var remove_item = function (array, item) {
        var index = find_item(array, item);
        if (index < 0) {
            return false
        } else if (index === 0) {
            array.shift()
        } else if ((index + 1) === array.length) {
            array.pop()
        } else {
            array.splice(index, 1)
        }
        return true
    };
    var find_item = function (array, item) {
        for (var i = 0; i < array.length; ++i) {
            if (objects_equal(array[i], item, false)) {
                return i
            }
        }
        return -1
    };
    mk.type.Arrays = {
        insert: insert_item,
        update: update_item,
        remove: remove_item,
        find: find_item,
        equals: function (array1, array2) {
            return objects_equal(array1, array2, false)
        },
        copy: copy_items,
        isArray: is_array
    };
    var Arrays = mk.type.Arrays;
    var get_enum_alias = function (enumeration, value) {
        var alias = null;
        Mapper.forEach(enumeration, function (n, e) {
            if (e instanceof BaseEnum && e.equals(value)) {
                alias = e.__alias;
                return true
            }
            return false
        });
        return alias
    };
    mk.type.BaseEnum = function (value, alias) {
        BaseObject.call(this);
        if (!alias) {
            alias = get_enum_alias(this, value)
        }
        this.__value = value;
        this.__alias = alias
    };
    var BaseEnum = mk.type.BaseEnum;
    Class(BaseEnum, BaseObject, null, {
        equals: function (other) {
            if (other instanceof BaseEnum) {
                if (this === other) {
                    return true
                }
                other = other.valueOf()
            }
            return this.__value === other
        }, toString: function () {
            return '<' + this.getName() + ': ' + this.getValue() + '>'
        }, valueOf: function () {
            return this.__value
        }, getValue: function () {
            return this.__value
        }, getName: function () {
            return this.__alias
        }
    });
    var enum_class = function (type) {
        var NamedEnum = function (value, alias) {
            BaseEnum.call(this, value, alias)
        };
        Class(NamedEnum, BaseEnum, null, {
            toString: function () {
                var clazz = NamedEnum.__type;
                if (!clazz) {
                    clazz = this.getClassName()
                }
                return '<' + clazz + ' ' + this.getName() + ': ' + this.getValue() + '>'
            }
        });
        NamedEnum.__type = type;
        return NamedEnum
    };
    mk.type.Enum = function (enumeration, elements) {
        if (IObject.isString(enumeration)) {
            enumeration = enum_class(enumeration)
        } else if (!enumeration) {
            enumeration = enum_class(null)
        } else {
            Class(enumeration, BaseEnum, null, null)
        }
        Mapper.forEach(elements, function (alias, value) {
            if (value instanceof BaseEnum) {
                value = value.getValue()
            } else if (typeof value !== 'number') {
                throw new TypeError('Enum value must be a number!');
            }
            enumeration[alias] = new enumeration(value, alias);
            return false
        });
        return enumeration
    };
    var Enum = mk.type.Enum;
    Enum.isEnum = function (obj) {
        return obj instanceof BaseEnum
    };
    Enum.getInt = function (obj) {
        if (obj instanceof BaseEnum) {
            return obj.getValue()
        } else if (IObject.isNumber(obj)) {
            return obj
        }
        return obj.valueOf()
    };
    mk.type.Set = Interface(null, [IObject]);
    var Set = mk.type.Set;
    Set.prototype = {
        isEmpty: function () {
        }, getLength: function () {
        }, contains: function (element) {
        }, add: function (element) {
        }, remove: function (element) {
        }, clear: function () {
        }, toArray: function () {
        }
    };
    mk.type.HashSet = function () {
        BaseObject.call(this);
        this.__array = []
    };
    var HashSet = mk.type.HashSet;
    Class(HashSet, BaseObject, [Set], {
        equals: function (other) {
            if (Interface.conforms(other, Set)) {
                if (this === other) {
                    return true
                }
                other = other.valueOf()
            }
            return Arrays.equals(this.__array, other)
        }, valueOf: function () {
            return this.__array
        }, toString: function () {
            return this.__array.toString()
        }, isEmpty: function () {
            return this.__array.length === 0
        }, getLength: function () {
            return this.__array.length
        }, contains: function (item) {
            var pos = Arrays.find(this.__array, item);
            return pos >= 0
        }, add: function (item) {
            var pos = Arrays.find(this.__array, item);
            if (pos < 0) {
                this.__array.push(item);
                return true
            } else {
                return false
            }
        }, remove: function (item) {
            return Arrays.remove(this.__array, item)
        }, clear: function () {
            this.__array = []
        }, toArray: function () {
            return this.__array.slice()
        }
    });
    mk.type.Stringer = Interface(null, [IObject]);
    var Stringer = mk.type.Stringer;
    Stringer.prototype = {
        isEmpty: function () {
        }, getLength: function () {
        }, equalsIgnoreCase: function (other) {
        }
    };
    mk.type.ConstantString = function (str) {
        BaseObject.call(this);
        if (!str) {
            str = ''
        } else if (Interface.conforms(str, Stringer)) {
            str = str.toString()
        }
        this.__string = str
    };
    var ConstantString = mk.type.ConstantString;
    Class(ConstantString, BaseObject, [Stringer], {
        equals: function (other) {
            if (Interface.conforms(other, Stringer)) {
                if (this === other) {
                    return true
                }
                other = other.valueOf()
            }
            return this.__string === other
        }, valueOf: function () {
            return this.__string
        }, toString: function () {
            return this.__string
        }, isEmpty: function () {
            return this.__string.length === 0
        }, getLength: function () {
            return this.__string.length
        }, equalsIgnoreCase: function (other) {
            if (this === other) {
                return true
            } else if (!other) {
                return !this.__string
            } else if (Interface.conforms(other, Stringer)) {
                return equalsIgnoreCase(this.__string, other.toString())
            } else {
                return equalsIgnoreCase(this.__string, other)
            }
        }
    });
    var equalsIgnoreCase = function (str1, str2) {
        if (str1.length !== str2.length) {
            return false
        }
        var low1 = str1.toLowerCase();
        var low2 = str2.toLowerCase();
        return low1 === low2
    };
    mk.type.Mapper = Interface(null, [IObject]);
    var Mapper = mk.type.Mapper;
    Mapper.prototype = {
        toMap: function () {
        }, copyMap: function (deepCopy) {
        }, isEmpty: function () {
        }, getLength: function () {
        }, allKeys: function () {
        }, getValue: function (key) {
        }, setValue: function (key, value) {
        }, removeValue: function (key) {
        }, getString: function (key, defaultValue) {
        }, getBoolean: function (key, defaultValue) {
        }, getInt: function (key, defaultValue) {
        }, getFloat: function (key, defaultValue) {
        }, getDateTime: function (key, defaultValue) {
        }, setDateTime: function (key, time) {
        }, setString: function (key, stringer) {
        }, setMap: function (key, mapper) {
        }
    };
    Mapper.count = function (dict) {
        if (!dict) {
            return 0
        } else if (Interface.conforms(dict, Mapper)) {
            dict = dict.toMap()
        } else if (typeof dict !== 'object') {
            throw TypeError('not a map: ' + dict);
        }
        return Object.keys(dict).length
    };
    Mapper.isEmpty = function (dict) {
        return Mapper.count(dict) === 0
    };
    Mapper.keys = function (dict) {
        if (!dict) {
            return null
        } else if (Interface.conforms(dict, Mapper)) {
            dict = dict.toMap()
        } else if (typeof dict !== 'object') {
            throw TypeError('not a map: ' + dict);
        }
        return Object.keys(dict)
    };
    Mapper.removeKey = function (dict, key) {
        if (!dict) {
            return null
        } else if (Interface.conforms(dict, Mapper)) {
            dict = dict.toMap()
        } else if (typeof dict !== 'object') {
            throw TypeError('not a map: ' + dict);
        }
        var value = dict[key];
        delete dict[key];
        return value
    };
    Mapper.forEach = function (dict, handleKeyValue) {
        if (!dict) {
            return -1
        } else if (Interface.conforms(dict, Mapper)) {
            dict = dict.toMap()
        } else if (typeof dict !== 'object') {
            throw TypeError('not a map: ' + dict);
        }
        var keys = Object.keys(dict);
        var cnt = keys.length;
        var stop;
        var i = 0, k, v;
        for (; i < cnt; ++i) {
            k = keys[i];
            v = dict[k];
            stop = handleKeyValue(k, v);
            if (stop) {
                break
            }
        }
        return i
    };
    Mapper.addAll = function (dict, fromDict) {
        if (!dict) {
            return -1
        } else if (Interface.conforms(dict, Mapper)) {
            dict = dict.toMap()
        } else if (typeof dict !== 'object') {
            throw TypeError('not a map: ' + dict);
        }
        return Mapper.forEach(fromDict, function (key, value) {
            dict[key] = value;
            return false
        })
    };
    mk.type.Dictionary = function (dict) {
        BaseObject.call(this);
        if (!dict) {
            dict = {}
        } else if (Interface.conforms(dict, Mapper)) {
            dict = dict.toMap()
        }
        this.__dictionary = dict
    };
    var Dictionary = mk.type.Dictionary;
    Class(Dictionary, BaseObject, [Mapper], {
        equals: function (other) {
            if (Interface.conforms(other, Mapper)) {
                if (this === other) {
                    return true
                }
                other = other.valueOf()
            }
            return Arrays.equals(this.__dictionary, other)
        }, valueOf: function () {
            return this.__dictionary
        }, toString: function () {
            return mk.format.JSON.encode(this.__dictionary)
        }, toMap: function () {
            return this.__dictionary
        }, copyMap: function (deepCopy) {
            if (deepCopy) {
                return Copier.deepCopyMap(this.__dictionary)
            } else {
                return Copier.copyMap(this.__dictionary)
            }
        }, isEmpty: function () {
            var keys = Object.keys(this.__dictionary);
            return keys.length === 0
        }, getLength: function () {
            var keys = Object.keys(this.__dictionary);
            return keys.length
        }, allKeys: function () {
            return Object.keys(this.__dictionary)
        }, getValue: function (key) {
            return this.__dictionary[key]
        }, setValue: function (key, value) {
            if (value) {
                this.__dictionary[key] = value
            } else if (this.__dictionary.hasOwnProperty(key)) {
                delete this.__dictionary[key]
            }
        }, removeValue: function (key) {
            var value;
            if (this.__dictionary.hasOwnProperty(key)) {
                value = this.__dictionary[key];
                delete this.__dictionary[key]
            } else {
                value = null
            }
            return value
        }, getString: function (key, defaultValue) {
            var value = this.__dictionary[key];
            return Converter.getString(value, defaultValue)
        }, getBoolean: function (key, defaultValue) {
            var value = this.__dictionary[key];
            return Converter.getBoolean(value, defaultValue)
        }, getInt: function (key, defaultValue) {
            var value = this.__dictionary[key];
            return Converter.getInt(value, defaultValue)
        }, getFloat: function (key, defaultValue) {
            var value = this.__dictionary[key];
            return Converter.getFloat(value, defaultValue)
        }, getDateTime: function (key, defaultValue) {
            var value = this.__dictionary[key];
            return Converter.getDateTime(value, defaultValue)
        }, setDateTime: function (key, time) {
            if (!time) {
                this.removeValue(key)
            } else if (time instanceof Date) {
                time = time.getTime() / 1000.0;
                this.__dictionary[key] = time
            } else {
                time = Converter.getFloat(time, 0);
                this.__dictionary[key] = time
            }
        }, setString: function (key, string) {
            if (!string) {
                this.removeValue(key)
            } else {
                this.__dictionary[key] = string.toString()
            }
        }, setMap: function (key, map) {
            if (!map) {
                this.removeValue(key)
            } else {
                this.__dictionary[key] = map.toMap()
            }
        }
    });
    mk.type.Wrapper = {
        fetchString: function (str) {
            if (Interface.conforms(str, Stringer)) {
                return str.toString()
            } else if (typeof str === 'string') {
                return str
            } else {
                return null
            }
        }, fetchMap: function (dict) {
            if (Interface.conforms(dict, Mapper)) {
                return dict.toMap()
            } else if (typeof dict === 'object') {
                return dict
            } else {
                return null
            }
        }, unwrap: function (object) {
            if (IObject.isNull(object)) {
                return null
            } else if (IObject.isBaseType(object)) {
                return object
            } else if (Enum.isEnum(object)) {
                return object.getValue()
            } else if (Interface.conforms(object, Stringer)) {
                return object.toString()
            } else if (Interface.conforms(object, Mapper)) {
                return this.unwrapMap(object.toMap())
            } else if (!Arrays.isArray(object)) {
                return this.unwrapMap(object)
            } else if (object instanceof Array) {
                return this.unwrapList(object)
            } else {
                return object
            }
        }, unwrapMap: function (dict) {
            var result = {};
            Mapper.forEach(dict, function (key, value) {
                result[key] = Wrapper.unwrap(value);
                return false
            });
            return result
        }, unwrapList: function (array) {
            var result = [];
            var count = array.length;
            for (var i = 0; i < count; ++i) {
                result[i] = this.unwrap(array[i])
            }
            return result
        }
    };
    var Wrapper = mk.type.Wrapper;
    mk.type.Copier = {
        copy: function (object) {
            if (IObject.isNull(object)) {
                return null
            } else if (IObject.isBaseType(object)) {
                return object
            } else if (Enum.isEnum(object)) {
                return object.getValue()
            } else if (Interface.conforms(object, Stringer)) {
                return object.toString()
            } else if (Interface.conforms(object, Mapper)) {
                return this.copyMap(object.toMap())
            } else if (!Arrays.isArray(object)) {
                return this.copyMap(object)
            } else if (object instanceof Array) {
                return this.copyList(object)
            } else {
                return object
            }
        }, copyMap: function (dict) {
            var clone = {};
            Mapper.forEach(dict, function (key, value) {
                clone[key] = value;
                return false
            });
            return clone
        }, copyList: function (array) {
            var clone = [];
            var count = array.length;
            for (var i = 0; i < count; ++i) {
                clone.push(array[i])
            }
            return clone
        }, deepCopy: function (object) {
            if (IObject.isNull(object)) {
                return null
            } else if (IObject.isBaseType(object)) {
                return object
            } else if (Enum.isEnum(object)) {
                return object.getValue()
            } else if (Interface.conforms(object, Stringer)) {
                return object.toString()
            } else if (Interface.conforms(object, Mapper)) {
                return this.deepCopyMap(object.toMap())
            } else if (!Arrays.isArray(object)) {
                return this.deepCopyMap(object)
            } else if (object instanceof Array) {
                return this.deepCopyList(object)
            } else {
                return object
            }
        }, deepCopyMap: function (dict) {
            var clone = {};
            Mapper.forEach(dict, function (key, value) {
                clone[key] = Copier.deepCopy(value);
                return false
            });
            return clone
        }, deepCopyList: function (array) {
            var clone = [];
            var count = array.length;
            for (var i = 0; i < count; ++i) {
                clone.push(this.deepCopy(array[i]))
            }
            return clone
        }
    };
    var Copier = mk.type.Copier;
    mk.digest.MessageDigester = Interface(null, null);
    var MessageDigester = mk.digest.MessageDigester;
    MessageDigester.prototype = {
        digest: function (data) {
        }
    };
    mk.digest.SHA256 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return sha256Digester
        }, setDigester: function (digester) {
            sha256Digester = digester
        }
    };
    var SHA256 = mk.digest.SHA256;
    var sha256Digester = null;
    mk.digest.RIPEMD160 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return ripemd160Digester
        }, setDigester: function (digester) {
            ripemd160Digester = digester
        }
    };
    var RIPEMD160 = mk.digest.RIPEMD160;
    var ripemd160Digester = null;
    mk.digest.KECCAK256 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return keccak256Digester
        }, setDigester: function (digester) {
            keccak256Digester = digester
        }
    };
    var KECCAK256 = mk.digest.KECCAK256;
    var keccak256Digester = null;
    mk.format.DataCoder = Interface(null, null);
    var DataCoder = mk.format.DataCoder;
    DataCoder.prototype = {
        encode: function (data) {
        }, decode: function (string) {
        }
    };
    mk.format.ObjectCoder = Interface(null, null);
    var ObjectCoder = mk.format.ObjectCoder;
    ObjectCoder.prototype = {
        encode: function (object) {
        }, decode: function (string) {
        }
    };
    mk.format.StringCoder = Interface(null, null);
    var StringCoder = mk.format.StringCoder;
    StringCoder.prototype = {
        encode: function (string) {
        }, decode: function (data) {
        }
    };
    mk.format.Hex = {
        encode: function (data) {
            return this.getCoder().encode(data)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return hexCoder
        }, setCoder: function (coder) {
            hexCoder = coder
        }
    };
    var Hex = mk.format.Hex;
    var hexCoder = null;
    mk.format.Base58 = {
        encode: function (data) {
            return this.getCoder().encode(data)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return base58Coder
        }, setCoder: function (coder) {
            base58Coder = coder
        }
    };
    var Base58 = mk.format.Base58;
    var base58Coder = null;
    mk.format.Base64 = {
        encode: function (data) {
            return this.getCoder().encode(data)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return base64Coder
        }, setCoder: function (coder) {
            base64Coder = coder
        }
    };
    var Base64 = mk.format.Base64;
    var base64Coder = null;
    mk.format.UTF8 = {
        encode: function (string) {
            return this.getCoder().encode(string)
        }, decode: function (data) {
            return this.getCoder().decode(data)
        }, getCoder: function () {
            return utf8Coder
        }, setCoder: function (coder) {
            utf8Coder = coder
        }
    };
    var UTF8 = mk.format.UTF8;
    var utf8Coder = null;
    mk.format.JSON = {
        encode: function (object) {
            return this.getCoder().encode(object)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return jsonCoder
        }, setCoder: function (coder) {
            jsonCoder = coder
        }
    };
    var jsonCoder = null;
    mk.format.JSONMap = {
        encode: function (dictionary) {
            return this.getCoder().encode(dictionary)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return jsonCoder
        }, setCoder: function (coder) {
            jsonCoder = coder
        }
    };
    var JSONMap = mk.format.JSONMap
})(MONKEY);
