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
        this.__stateMap = {};  // String => State
    };
    sys.Class(BaseMachine, Object, [Machine], null);

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

    // protected
    BaseMachine.prototype.getContext = function () {
        // context is the machine
        // return this;
        ns.assert(false, 'implement me!');
        return null;
    };

    //-------- States

    /**
     *  Add state with name
     *
     * @param {State} state
     * @param {String} name
     */
    BaseMachine.prototype.setState = function (state, name) {
        this.__stateMap[name] = state;
    };
    BaseMachine.prototype.getState = function (name) {
        return this.__stateMap[name];
    };

    // Override
    BaseMachine.prototype.getDefaultState = function () {
        return this.__stateMap[this.__default];
    };

    // Override
    BaseMachine.prototype.getTargetState = function (transition) {
        return this.__stateMap[transition.getTarget()];
    };

    // Override
    BaseMachine.prototype.getCurrentState = function () {
        return this.__current;
    };

    // Override
    BaseMachine.prototype.setCurrentState = function (state) {
        return this.__current = state;
    };

    // Override
    BaseMachine.prototype.changeState = function (newState) {
        var oldState = this.getCurrentState();
        if (!oldState) {
            if (!newState) {
                // state not change
                return false;
            }
        } else if (oldState.equals(newState)) {
            // state not change
            return false;
        }

        var machine = this.getContext();
        var delegate = this.getDelegate();

        // events before state changed
        if (delegate) {
            delegate.enterState(newState, machine);
        }
        if (newState) {
            newState.onEnter(machine);
        }

        // change state
        this.setCurrentState(newState);

        // events after state changed
        if (delegate) {
            delegate.exitState(oldState, machine);
        }
        if (oldState) {
            oldState.onExit(machine);
        }
        return true;
    };

    //-------- Actions

    /**
     *  start machine from default state
     */
    // Override
    BaseMachine.prototype.start = function () {
        this.changeState(this.getDefaultState());
        this.__status = Status.Running;
    };

    /**
     *  stop machine and set current state to null
     */
    // Override
    BaseMachine.prototype.stop = function () {
        this.__status = Status.Stopped;
        this.changeState(null);
    };

    /**
     *  pause machine, current state not change
     */
    // Override
    BaseMachine.prototype.pause = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        // events before state paused
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(current, machine);
        }
        current.onPause(machine);
        // pause state
        this.__status = Status.Paused;
    };

    /**
     *  resume machine with current state
     */
    // Override
    BaseMachine.prototype.resume = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        // resume state
        this.__status = Status.Running;
        // events after state resumed
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(current, machine);
        }
        current.onResume(machine);
    };

    //-------- Ticker

    /**
     *  Drive the machine running forward
     */
    // Override
    BaseMachine.prototype.tick = function (now, delta) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.Running.equals(this.__status)) {
            var transition = current.evaluate(machine);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next);
            }
        }
    };

    //-------- namespace --------
    ns.BaseMachine = BaseMachine;

    ns.registers('BaseMachine');

})(FiniteStateMachine, MONKEY);
