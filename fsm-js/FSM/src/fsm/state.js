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

//! require 'transition.js'

(function (ns, sys) {
    "use strict";

    var BaseObject = sys.type.BaseObject;

    /**
     *  Finite State
     *  ~~~~~~~~~~~~
     */
    var State = function () {};
    sys.Interface(State, [sys.type.Object]);

    /**
     *  Callback when enter state
     *
     * @param {Context} machine
     */
    State.prototype.onEnter = function (machine) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Callback when exit state
     *
     * @param {Context} machine
     */
    State.prototype.onExit = function (machine) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Callback when state paused
     *
     * @param {Context} machine
     */
    State.prototype.onPause = function (machine) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Callback when state resumed
     *
     * @param {Context} machine
     */
    State.prototype.onResume = function (machine) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Evaluate all transitions for this state
     *  (called by machine.tick)
     *
     * @param {Context} machine
     * @returns {Transition} success transition, or null to stay the current state
     */
    State.prototype.evaluate = function (machine) {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  State with transitions
     *  ~~~~~~~~~~~~~~~~~~~~~~
     */
    var BaseState = function () {
        BaseObject.call(this);
        this.__transitions = [];
    };
    sys.Class(BaseState, BaseObject, [State], null);

    /**
     *  Append a transition for this state
     *
     * @param {Transition} transition
     */
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) < 0) {
            this.__transitions.push(transition);
        } else {
            throw new Error('transition exists: ' + transition);
        }
    };

    // Override
    BaseState.prototype.evaluate = function (machine) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(machine)) {
                // OK, get target state from this transition
                return transition;
            }
        }
    };

    //-------- namespace --------
    ns.State = State;
    ns.BaseState = BaseState;

    ns.registers('State');
    ns.registers('BaseState');

})(FiniteStateMachine, MONKEY);
