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

(function (ns, sys) {
    "use strict";

    var Class      = sys.type.Class;
    var Enum       = sys.type.Enum;
    var BaseObject = sys.type.BaseObject;

    var Transition = ns.Transition;
    var State      = ns.State;
    var Machine    = ns.Machine;

    /**
     *  Base Transition
     *  ~~~~~~~~~~~~~~~
     *  Transition with the index of target state
     *
     * @param {uint} target
     */
    var BaseTransition = function (target) {
        Object.call(this);
        this.__target = target;
    };
    Class(BaseTransition, Object, [Transition], null);

    /**
     *  Get index of target state
     *
     * @return {uint} target state index
     */
    BaseTransition.prototype.getTarget = function () {
        return this.__target;
    };

    /**
     *  Base State
     *  ~~~~~~~~~~
     *  State with index & transitions
     *
     * @param {uint} index - state index
     */
    var BaseState = function (index) {
        BaseObject.call(this);
        this.__index = index;
        this.__transitions = [];
    };
    Class(BaseState, BaseObject, [State], null);

    // Override
    BaseState.prototype.equals = function (other) {
        if (other instanceof BaseState) {
            if (other === this) {
                // same object
                return true;
            }
            other = other.getIndex();
        } else if (Enum.isEnum(other)) {
            other = other.getValue();
        }
        return this.__index === other;
    };

    // Override
    BaseState.prototype.toString = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var index = this.getIndex();
        return '<' + clazz + ' index=' + index + ' />'
    };

    // Override
    BaseState.prototype.valueOf = function () {
        return this.__index;
    };

    /**
     *  Get state index
     *
     * @return {uint} state index
     */
    BaseState.prototype.getIndex = function () {
        return this.__index;
    };

    /**
     *  Append a transition for this state
     *
     * @param {Transition} transition
     */
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) >= 0) {
            throw new ReferenceError('transition exists: ' + transition);
        }
        this.__transitions.push(transition);
    };

    // Override
    BaseState.prototype.evaluate = function (ctx, now) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(ctx, now)) {
                // OK, get target state from this transition
                return transition;
            }
        }
    };

    /**
     *  Machine Status
     *  ~~~~~~~~~~~~~~
     */
    var Status = Enum('MachineStatus', {
        STOPPED: 0,
        RUNNING: 1,
        PAUSED: 2
    });

    /**
     *  Base Machine
     *  ~~~~~~~~~~~~
     */
    var BaseMachine = function () {
        BaseObject.call(this);
        this.__states = [];   // List<State>
        this.__current = -1;  // current state index
        this.__status = Status.STOPPED;
        this.__delegate = null;
    };
    Class(BaseMachine, BaseObject, [Machine], null);

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
        // return this;  //  the machine itself
    };

    //-------- States

    /**
     *  Add state with index
     *
     * @param {State|BaseState} newState
     * @return {State} old state
     */
    BaseMachine.prototype.addState = function (newState) {
        var index = newState.getIndex();
        if (index < this.__states.length) {
            // WARNING: return old state that was replaced
            var old = this.__states[index];
            this.__states[index] = newState;
            return old;
        }
        // filling empty spaces
        var spaces = index - this.__states.length;
        for (var i = 0; i < spaces; ++i) {
            this.__states.push(null);
        }
        // append the new state to the tail
        this.__states.push(newState);
        return null;
    };

    /**
     *  Get state with index
     *
     * @param {uint} index
     * @return {State}
     */
    BaseMachine.prototype.getState = function (index) {
        return this.__states[index];
    };

    /**
     *  Get default state
     *
     * @return {State} the first state
     */
    // protected
    BaseMachine.prototype.getDefaultState = function () {
        if (this.__states.length === 0) {
            throw new ReferenceError('states empty');
        }
        return this.__states[0];
    };

    /**
     *  Get target state of this transition
     *
     * @param {Transition|BaseTransition} transition - success transition
     * @return {State} target state of this transition
     */
    // protected
    BaseMachine.prototype.getTargetState = function (transition) {
        var index = transition.getTarget();
        return this.__states[index];
    };

    // Override
    BaseMachine.prototype.getCurrentState = function () {
        var index = this.__current;
        return index < 0 ? null : this.__states[index];
    };

    // private
    BaseMachine.prototype.setCurrentState = function (state) {
        this.__current = !state ? -1 : state.getIndex();
    };

    /**
     *  Exit current state, and enter new state
     *
     * @param {State|BaseState} newState - next state
     * @param {Date} now                 - current time
     * @return {boolean} true on state changed
     */
    // private
    BaseMachine.prototype.changeState = function (newState, now) {
        var oldState = this.getCurrentState();
        if (!oldState) {
            if (!newState) {
                // state not change
                return false;
            }
        } else if (oldState === newState) {
            // state not change
            return false;
        }

        var ctx = this.getContext();
        var delegate = this.getDelegate();

        //
        //  Events before state changed
        //
        if (delegate) {
            // prepare for changing current state to the new one,
            // the delegate can get old state via ctx if need
            delegate.enterState(newState, ctx, now);
        }
        if (oldState) {
            oldState.onExit(newState, ctx, now);
        }

        //
        //  Change current state
        //
        this.setCurrentState(newState);

        //
        //  Events after state changed
        //
        if (newState) {
            newState.onEnter(oldState, ctx, now);
        }
        if (delegate) {
            // handle after the current state changed,
            // the delegate can get new state via ctx if need
            delegate.exitState(oldState, ctx, now);
        }

        return true;
    };

    //-------- Actions

    /**
     *  start machine from default state
     */
    // Override
    BaseMachine.prototype.start = function () {
        var now = new Date();
        this.changeState(this.getDefaultState(), now);
        this.__status = Status.RUNNING;
    };

    /**
     *  stop machine and set current state to null
     */
    // Override
    BaseMachine.prototype.stop = function () {
        this.__status = Status.STOPPED;
        var now = new Date();
        this.changeState(null, now);  // force current state to null
    };

    /**
     *  pause machine, current state not change
     */
    // Override
    BaseMachine.prototype.pause = function () {
        var now = new Date();
        var ctx = this.getContext();
        var current = this.getCurrentState();
        //
        //  Events before state paused
        //
        if (current) {
            current.onPause(ctx, now);
        }
        //
        //  Pause current state
        //
        this.__status = Status.PAUSED;
        //
        //  Events after state paused
        //
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(current, ctx, now);
        }
    };

    /**
     *  resume machine with current state
     */
    // Override
    BaseMachine.prototype.resume = function () {
        var now = new Date();
        var ctx = this.getContext();
        var current = this.getCurrentState();
        //
        //  Events before state resumed
        //
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(current, ctx, now);
        }
        //
        //  Resume current state
        //
        this.__status = Status.RUNNING;
        //
        //  Events after state resumed
        //
        if (current) {
            current.onResume(ctx, now);
        }
    };

    //-------- Ticker

    /**
     *  Drive the machine running forward
     */
    // Override
    BaseMachine.prototype.tick = function (now, elapsed) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.RUNNING.equals(this.__status)) {
            var transition = current.evaluate(machine, now);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next, now);
            }
        }
    };

    //-------- namespace --------
    ns.BaseTransition = BaseTransition;
    ns.BaseState      = BaseState;
    ns.BaseMachine    = BaseMachine;

})(FiniteStateMachine, MONKEY);
