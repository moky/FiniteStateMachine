/**
 * JavaScript Library (v1.0.0)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 16, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof MONKEY !== 'object') {
    MONKEY = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.type !== 'object') {
        ns.type = {}
    }
    if (typeof ns.format !== 'object') {
        ns.format = {}
    }
    if (typeof ns.digest !== 'object') {
        ns.digest = {}
    }
    if (typeof ns.crypto !== 'object') {
        ns.crypto = {}
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var conforms = function (object, protocol) {
        if (!object) {
            return false
        } else if (object instanceof protocol) {
            return true
        }
        return check_class(object.constructor, protocol)
    };
    var check_class = function (constructor, protocol) {
        var interfaces = constructor._mk_interfaces;
        if (interfaces && check_interfaces(interfaces, protocol)) {
            return true
        }
        var parent = constructor._mk_parent;
        return parent && check_class(parent, protocol)
    };
    var check_interfaces = function (interfaces, protocol) {
        var child, parents;
        for (var i = 0; i < interfaces.length; ++i) {
            child = interfaces[i];
            if (child === protocol) {
                return true
            }
            parents = child._mk_parents;
            if (parents && check_interfaces(parents, protocol)) {
                return true
            }
        }
        return false
    };
    var def_methods = function (clazz, methods) {
        var names = Object.keys(methods);
        var key, fn;
        for (var i = 0; i < names.length; ++i) {
            key = names[i];
            fn = methods[key];
            if (typeof fn === 'function') {
                clazz.prototype[key] = fn
            }
        }
        return clazz
    };
    var interfacefy = function (child, parents) {
        if (!child) {
            child = function () {
            }
        }
        if (parents) {
            child._mk_parents = parents
        }
        return child
    };
    interfacefy.conforms = conforms;
    var classify = function (child, parent, interfaces, methods) {
        if (!child) {
            child = function () {
                Object.call(this)
            }
        }
        if (parent) {
            child._mk_parent = parent
        } else {
            parent = Object
        }
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        if (interfaces) {
            child._mk_interfaces = interfaces
        }
        if (methods) {
            def_methods(child, methods)
        }
        return child
    };
    ns.type.Interface = interfacefy;
    ns.type.Class = classify
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var is_null = function (object) {
        if (typeof object === 'undefined') {
            return true
        } else {
            return object === null
        }
    };
    var is_string = function (object) {
        return typeof object === 'string'
    };
    var is_number = function (object) {
        return typeof object === 'number'
    };
    var is_boolean = function (object) {
        return typeof object === 'boolean'
    };
    var is_function = function (object) {
        return typeof object === 'function'
    };
    var is_base_type = function (object) {
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
    var IObject = Interface(null, null);
    IObject.prototype.getClassName = function () {
    };
    IObject.prototype.equals = function (other) {
    };
    IObject.prototype.valueOf = function () {
    };
    IObject.prototype.toString = function () {
    };
    IObject.isNull = is_null;
    IObject.isString = is_string;
    IObject.isNumber = is_number;
    IObject.isBoolean = is_boolean;
    IObject.isFunction = is_function;
    IObject.isBaseType = is_base_type;
    var BaseObject = function () {
        Object.call(this)
    };
    Class(BaseObject, Object, [IObject], null);
    BaseObject.prototype.getClassName = function () {
        return Object.getPrototypeOf(this).constructor.name
    };
    BaseObject.prototype.equals = function (other) {
        return this === other
    };
    ns.type.Object = IObject;
    ns.type.BaseObject = BaseObject
})(MONKEY);
(function (ns) {
    'use strict';
    var IObject = ns.type.Object;
    var getString = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isString(value)) {
            return value
        } else {
            return value.toString()
        }
    };
    var getDateTime = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (value instanceof Date) {
            return value
        }
        var seconds = getFloat(value, 0);
        var millis = seconds * 1000;
        return new Date(millis)
    };
    var getInt = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isNumber(value)) {
            return value
        } else if (IObject.isBoolean(value)) {
            return value ? 1 : 0
        } else {
            var str = IObject.isString(value) ? value : value.toString();
            return parseInt(str)
        }
    };
    var getFloat = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isNumber(value)) {
            return value
        } else if (IObject.isBoolean(value)) {
            return value ? 1.0 : 0.0
        } else {
            var str = IObject.isString(value) ? value : value.toString();
            return parseFloat(str)
        }
    };
    var getBoolean = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isBoolean(value)) {
            return value
        } else if (IObject.isNumber(value)) {
            return value > 0 || value < 0
        }
        var text;
        if (IObject.isString(value)) {
            text = value
        } else {
            text = value.toString()
        }
        text = text.trim();
        var size = text.length;
        if (size === 0) {
            return false
        } else if (size > ns.type.Converter.kMaxBoolLen) {
            return true
        } else {
            text = text.toLowerCase()
        }
        var state = kBoolStates[text];
        return IObject.isNull(state) || state
    };
    var kBoolStates = {
        '1': true,
        'yes': true,
        'true': true,
        'on': true,
        '0': false,
        'no': false,
        'false': false,
        'off': false,
        '+0': false,
        '-0': false,
        '+0.0': false,
        '-0.0': false,
        'none': false,
        'null': false,
        'undefined': false
    };
    var kMaxBoolLen = 'undefined'.length;
    ns.type.Converter = {
        getString: getString,
        getDateTime: getDateTime,
        getInt: getInt,
        getFloat: getFloat,
        getBoolean: getBoolean,
        kBoolStates: kBoolStates,
        kMaxBoolLen: kMaxBoolLen
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var IObject = ns.type.Object;
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
    ns.type.Arrays = {
        insert: insert_item,
        update: update_item,
        remove: remove_item,
        find: find_item,
        equals: function (array1, array2) {
            return objects_equal(array1, array2, false)
        },
        copy: copy_items,
        isArray: is_array
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var is_enum = function (obj) {
        return obj instanceof BaseEnum
    };
    var get_int = function (obj) {
        if (obj instanceof BaseEnum) {
            return obj.getValue()
        } else if (IObject.isNumber(obj)) {
            return obj
        }
        return obj.valueOf()
    };
    var get_alias = function (enumeration, value) {
        var keys = Object.keys(enumeration);
        var e;
        for (var k in keys) {
            e = enumeration[k];
            if (e instanceof BaseEnum && e.equals(value)) {
                return e.__alias
            }
        }
        return null
    };
    var BaseEnum = function (value, alias) {
        BaseObject.call(this);
        if (!alias) {
            alias = get_alias(this, value)
        }
        this.__value = value;
        this.__alias = alias
    };
    Class(BaseEnum, BaseObject, null, null);
    BaseEnum.prototype.equals = function (other) {
        if (other instanceof BaseEnum) {
            if (this === other) {
                return true
            }
            other = other.valueOf()
        }
        return this.__value === other
    };
    BaseEnum.prototype.toString = function () {
        return '<' + this.getName() + ': ' + this.getValue() + '>'
    };
    BaseEnum.prototype.valueOf = function () {
        return this.__value
    };
    BaseEnum.prototype.getValue = function () {
        return this.__value
    };
    BaseEnum.prototype.getName = function () {
        return this.__alias
    };
    var enum_class = function (type) {
        var Enum = function (value, alias) {
            BaseEnum.call(this, value, alias)
        };
        Class(Enum, BaseEnum, null, {
            toString: function () {
                var clazz = Enum.__type;
                if (!clazz) {
                    clazz = this.getClassName()
                }
                return '<' + clazz + ' ' + this.getName() + ': ' + this.getValue() + '>'
            }
        });
        Enum.__type = type;
        return Enum
    };
    var enumify = function (enumeration, elements) {
        if (IObject.isString(enumeration)) {
            enumeration = enum_class(enumeration)
        } else if (!enumeration) {
            enumeration = enum_class(null)
        } else {
            Class(enumeration, BaseEnum, null, null)
        }
        var keys = Object.keys(elements);
        var alias, value;
        for (var i = 0; i < keys.length; ++i) {
            alias = keys[i];
            value = elements[alias];
            if (value instanceof BaseEnum) {
                value = value.getValue()
            } else if (typeof value !== 'number') {
                throw new TypeError('Enum value must be a number!');
            }
            enumeration[alias] = new enumeration(value, alias)
        }
        return enumeration
    };
    enumify.isEnum = is_enum;
    enumify.getInt = get_int;
    ns.type.Enum = enumify
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var Arrays = ns.type.Arrays;
    var Set = Interface(null, [IObject]);
    Set.prototype.isEmpty = function () {
    };
    Set.prototype.getLength = function () {
    };
    Set.prototype.contains = function (element) {
    };
    Set.prototype.add = function (element) {
    };
    Set.prototype.remove = function (element) {
    };
    Set.prototype.clear = function () {
    };
    Set.prototype.toArray = function () {
    };
    var HashSet = function () {
        BaseObject.call(this);
        this.__array = []
    };
    Class(HashSet, BaseObject, [Set], null);
    HashSet.prototype.equals = function (other) {
        if (Interface.conforms(other, Set)) {
            if (this === other) {
                return true
            }
            other = other.valueOf()
        }
        return Arrays.equals(this.__array, other)
    };
    HashSet.prototype.valueOf = function () {
        return this.__array
    };
    HashSet.prototype.toString = function () {
        return this.__array.toString()
    };
    HashSet.prototype.isEmpty = function () {
        return this.__array.length === 0
    };
    HashSet.prototype.getLength = function () {
        return this.__array.length
    };
    HashSet.prototype.contains = function (item) {
        var pos = Arrays.find(this.__array, item);
        return pos >= 0
    };
    HashSet.prototype.add = function (item) {
        var pos = Arrays.find(this.__array, item);
        if (pos < 0) {
            this.__array.push(item);
            return true
        } else {
            return false
        }
    };
    HashSet.prototype.remove = function (item) {
        return Arrays.remove(this.__array, item)
    };
    HashSet.prototype.clear = function () {
        this.__array = []
    };
    HashSet.prototype.toArray = function () {
        return this.__array.slice()
    };
    ns.type.Set = Set;
    ns.type.HashSet = HashSet
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var Stringer = Interface(null, [IObject]);
    Stringer.prototype.isEmpty = function () {
    };
    Stringer.prototype.getLength = function () {
    };
    Stringer.prototype.equalsIgnoreCase = function (other) {
    };
    var ConstantString = function (str) {
        BaseObject.call(this);
        if (!str) {
            str = ''
        } else if (Interface.conforms(str, Stringer)) {
            str = str.toString()
        }
        this.__string = str
    };
    Class(ConstantString, BaseObject, [Stringer], null);
    ConstantString.prototype.equals = function (other) {
        if (Interface.conforms(other, Stringer)) {
            if (this === other) {
                return true
            }
            other = other.valueOf()
        }
        return this.__string === other
    };
    ConstantString.prototype.valueOf = function () {
        return this.__string
    };
    ConstantString.prototype.toString = function () {
        return this.__string
    };
    ConstantString.prototype.isEmpty = function () {
        return this.__string.length === 0
    };
    ConstantString.prototype.getLength = function () {
        return this.__string.length
    };
    ConstantString.prototype.equalsIgnoreCase = function (other) {
        if (this === other) {
            return true
        } else if (!other) {
            return !this.__string
        } else if (Interface.conforms(other, Stringer)) {
            return equalsIgnoreCase(this.__string, other.toString())
        } else {
            return equalsIgnoreCase(this.__string, other)
        }
    };
    var equalsIgnoreCase = function (str1, str2) {
        if (str1.length !== str2.length) {
            return false
        }
        var low1 = str1.toLowerCase();
        var low2 = str2.toLowerCase();
        return low1 === low2
    };
    ns.type.Stringer = Stringer;
    ns.type.ConstantString = ConstantString
})(MONKEY);
