'use strict';

//-------- namespace --------
if (typeof fsm.type !== 'object') {
    fsm.type = {};
}
if (typeof fsm.skywalker !== 'object') {
    fsm.skywalker = {};
}
if (typeof fsm.threading !== 'object') {
    fsm.threading = {};
}

//-------- requires --------
var Interface      = mk.type.Interface;
var Class          = mk.type.Class;
var Implementation = mk.type.Implementation;
var Converter      = mk.type.Converter;
var BaseObject     = mk.type.BaseObject;
var HashSet        = mk.type.HashSet;
var Enum           = mk.type.Enum;
