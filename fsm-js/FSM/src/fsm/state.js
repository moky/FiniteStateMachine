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

    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var BaseObject = sys.type.BaseObject;

    /**
     *  Finite State
     *  ~~~~~~~~~~~~
     */
    var State = Interface(null, null);

    /**
     *  Called after new state entered
     *
     * @param {State} previous  - old state
     * @param {Context} machine - context
     * @param {number} now      - current time (milliseconds, from Jan 1, 1970 UTC)
     */
    State.prototype.onEnter = function (previous, machine, now) {
        throw new Error('NotImplemented');
    };

    /**
     *  Called before old state exited
     *
     * @param {State} next      - new state
     * @param {Context} machine - context
     * @param {number} now      - current time (milliseconds, from Jan 1, 1970 UTC)
     */
    State.prototype.onExit = function (next, machine, now) {
        throw new Error('NotImplemented');
    };

    /**
     *  Called before current state paused
     *
     * @param {Context} machine - context
     */
    State.prototype.onPause = function (machine) {
        throw new Error('NotImplemented');
    };

    /**
     *  Called after current state resumed
     *
     * @param {Context} machine - context
     */
    State.prototype.onResume = function (machine) {
        throw new Error('NotImplemented');
    };

    /**
     *  Evaluate all transitions for this state
     *  (called by machine.tick)
     *
     * @param {Context} machine - context
     * @param {number} now      - current time (milliseconds, from Jan 1, 1970 UTC)
     * @returns {Transition} success transition, or null to stay the current state
     */
    State.prototype.evaluate = function (machine, now) {
        throw new Error('NotImplemented');
    };

    /**
     *  State with transitions
     *  ~~~~~~~~~~~~~~~~~~~~~~
     */
    var BaseState = function () {
        BaseObject.call(this);
        this.__transitions = [];
    };
    Class(BaseState, BaseObject, [State], null);

    /**
     *  Append a transition for this state
     *
     * @param {Transition} transition
     */
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) >= 0) {
            throw new Error('transition exists: ' + transition);
        }
        this.__transitions.push(transition);
    };

    // Override
    BaseState.prototype.evaluate = function (machine, now) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(machine, now)) {
                // OK, get target state from this transition
                return transition;
            }
        }
    };

    //-------- namespace --------
    ns.State = State;
    ns.BaseState = BaseState;

})(FiniteStateMachine, MONKEY);
