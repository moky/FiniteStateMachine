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

//! require 'machine.js'
//! require 'delegate.js'

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;

    var Status = ns.Status;
    var Machine = ns.Machine;

    /**
     *  Create a State Machine with default state name
     *
     * @param {String} defaultStateName
     */
    var BaseMachine = function (defaultStateName) {
        Object.call(this);
        this.__default = defaultStateName ? defaultStateName : 'default';
        this.__current = null;  // current state
        this.__status = Status.Stopped;
        this.__delegate = null;
        this.__states = {};  // String => State
    };
    Class(BaseMachine, Object, [Machine], null);

    /**
     *  Set machine delegate
     *
     * @param {Delegate} delegate
     */
    BaseMachine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    BaseMachine.prototype.getDelegate = function () {
        return this.__delegate;
    };

    // protected: the machine itself
    BaseMachine.prototype.getContext = function () {
        throw new Error('NotImplemented');
        // return this;
    };

    //-------- States

    /**
     *  Add state with name
     *
     * @param {String} name
     * @param {State} state
     */
    BaseMachine.prototype.setState = function (name, state) {
        this.__states[name] = state;
    };
    BaseMachine.prototype.getState = function (name) {
        return this.__states[name];
    };

    /**
     *  Get default state
     *
     * @return {State}
     */
    BaseMachine.prototype.getDefaultState = function () {
        return this.__states[this.__default];
    };

    /**
     *  Get target state of transition
     *
     * @param {Transition|BaseTransition} transition - success transition
     * @return {State}
     */
    BaseMachine.prototype.getTargetState = function (transition) {
        var name = transition.getTarget();
        return this.__states[name];
    };

    // Override
    BaseMachine.prototype.getCurrentState = function () {
        return this.__current;
    };

    /**
     *  Set current state
     *
     * @param {State} state - new state
     */
    BaseMachine.prototype.setCurrentState = function (state) {
        return this.__current = state;
    };

    var states_changed = function (oldState, newState) {
        if (!oldState) {
            if (!newState) {
                // state not change
                return false;
            }
        } else if (oldState.equals(newState)) {
            // state not change
            return false;
        }
        return true;
    };

    /**
     *  Exit current state, and enter new state
     *
     * @param {State} newState - next state
     * @param {number} now     - current time (milliseconds, from Jan 1, 1970 UTC)
     * @return {boolean} true on state changed
     */
    BaseMachine.prototype.changeState = function (newState, now) {
        var oldState = this.getCurrentState();
        if (!states_changed(oldState, newState)) {
            // state not change
            return false;
        }

        var machine = this.getContext();
        var delegate = this.getDelegate();

        //
        //  Events before state changed
        //
        if (delegate) {
            // prepare for changing current state to the new one,
            // the delegate can get old state via ctx if need
            delegate.enterState(newState, machine);
        }
        if (oldState) {
            oldState.onExit(newState, machine, now);
        }

        //
        //  Change current state
        //
        this.setCurrentState(newState);

        //
        //  Events after state changed
        //
        if (newState) {
            newState.onEnter(oldState, machine, now);
        }
        if (delegate) {
            // handle after the current state changed,
            // the delegate can get new state via ctx if need
            delegate.exitState(oldState, machine);
        }

        return true;
    };

    //-------- Actions

    /**
     *  start machine from default state
     */
    // Override
    BaseMachine.prototype.start = function () {
        var now = (new Date()).getTime();
        this.changeState(this.getDefaultState(), now);
        this.__status = Status.Running;
    };

    /**
     *  stop machine and set current state to null
     */
    // Override
    BaseMachine.prototype.stop = function () {
        this.__status = Status.Stopped;
        var now = (new Date()).getTime();
        this.changeState(null, now);  // force current state to null
    };

    /**
     *  pause machine, current state not change
     */
    // Override
    BaseMachine.prototype.pause = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        //
        //  Events before state paused
        //
        if (current) {
            current.onPause(machine);
        }
        //
        //  Pause current state
        //
        this.__status = Status.Paused;
        //
        //  Events after state paused
        //
        if (delegate) {
            delegate.pauseState(current, machine);
        }
    };

    /**
     *  resume machine with current state
     */
    // Override
    BaseMachine.prototype.resume = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        //
        //  Events before state resumed
        //
        if (delegate) {
            delegate.resumeState(current, machine);
        }
        //
        //  Resume current state
        //
        this.__status = Status.Running;
        //
        //  Events after state resumed
        //
        current.onResume(machine);
    };

    //-------- Ticker

    /**
     *  Drive the machine running forward
     */
    // Override
    BaseMachine.prototype.tick = function (now, elapsed) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.Running.equals(this.__status)) {
            var transition = current.evaluate(machine, now);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next, now);
            }
        }
    };

    //-------- namespace --------
    ns.BaseMachine = BaseMachine;

})(FiniteStateMachine, MONKEY);
