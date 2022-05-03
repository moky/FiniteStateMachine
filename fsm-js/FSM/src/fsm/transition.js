;
// license: https://mit-license.org
//
//  Finite State Machine
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    /**
     *  State Machine Context
     *  ~~~~~~~~~~~~~~~~~~~~~
     */
    var Context = function () {};
    sys.Interface(Context, null);

    /**
     *  Machine Status
     *  ~~~~~~~~~~~~~~
     */
    var Status = sys.type.Enum(null, {
        Stopped: 0,
        Running: 1,
        Paused: 2
    });

    //-------- namespace --------
    ns.Context = Context;
    ns.Status = Status;

    ns.registers('Context');
    ns.registers('Status');

})(FiniteStateMachine, MONKEY);

(function (ns, sys) {
    "use strict";

    /**
     *  State Transition
     *  ~~~~~~~~~~~~~~~~
     */
    var Transition = function () {};
    sys.Interface(Transition, null);

    /**
     *  Evaluate the current state
     *
     * @param {Context} machine
     * @returns {boolean}
     */
    Transition.prototype.evaluate = function (machine) {
        ns.assert(false, 'implement me!');
        return false;
    };

    /**
     *  Transition with the name of target state
     *
     * @param {String} targetStateName
     */
    var BaseTransition = function (targetStateName) {
        Object.call(this);
        this.__target = targetStateName;
    };
    sys.Class(BaseTransition, Object, [Transition], null);

    /**
     *  Get name of target state
     *
     * @return {String}
     */
    BaseTransition.prototype.getTarget = function () {
        return this.__target;
    };

    //-------- namespace --------
    ns.Transition = Transition;
    ns.BaseTransition = BaseTransition;

    ns.registers('Transition');
    ns.registers('BaseTransition');

})(FiniteStateMachine, MONKEY);
