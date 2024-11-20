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

//! require 'threading/ticker.js'
//! require 'transition.js'
//! require 'state.js'

(function (ns, sys) {
    "use strict";

    var Interface = sys.type.Interface;
    var Ticker = ns.threading.Ticker;

    /**
     *  State Machine Context
     *  ~~~~~~~~~~~~~~~~~~~~~
     */
    var Context = Interface(null, null);

    /**
     *  State Transition
     *  ~~~~~~~~~~~~~~~~
     */
    var Transition = Interface(null, null);

    /**
     *  Evaluate the current state
     *
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     * @returns {boolean} true when current state should be changed
     */
    Transition.prototype.evaluate = function (ctx, now) {};

    /**
     *  Finite State
     *  ~~~~~~~~~~~~
     */
    var State = Interface(null, null);

    /**
     *  Evaluate all transitions for this state
     *  (called by machine.tick)
     *
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     * @returns {Transition} success transition, or null to stay the current state
     */
    State.prototype.evaluate = function (ctx, now) {};

    //-------- events

    /**
     *  Called after new state entered
     *
     * @param {State} previous - old state
     * @param {Context} ctx    - context (machine)
     * @param {Date} now       - current time
     */
    State.prototype.onEnter = function (previous, ctx, now) {};

    /**
     *  Called before old state exited
     *
     * @param {State} next  - new state
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     */
    State.prototype.onExit = function (next, ctx, now) {};

    /**
     *  Called before current state paused
     *
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     */
    State.prototype.onPause = function (ctx, now) {};

    /**
     *  Called after current state resumed
     *
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     */
    State.prototype.onResume = function (ctx, now) {};

    /**
     *  State Machine Delegate
     *  ~~~~~~~~~~~~~~~~~~~~~~
     */
    var Delegate = Interface(null, null);

    /**
     *  Called before new state entered
     *  (get current state from context)
     *
     * @param {State} next  - new state
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     */
    Delegate.prototype.enterState = function (next, ctx, now) {};

    /**
     *  Called after old state exited
     *  (get current state from context)
     *
     * @param {State} previous - old state
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     */
    Delegate.prototype.exitState = function (previous, ctx, now) {};

    /**
     *  Called after current state paused
     *
     * @param {State} current - current state
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     */
    Delegate.prototype.pauseState = function (current, ctx, now) {};

    /**
     *  Called before current state resumed
     *
     * @param {State} current - current state
     * @param {Context} ctx - context (machine)
     * @param {Date} now    - current time
     */
    Delegate.prototype.resumeState = function (current, ctx, now) {};

    /**
     *  State Machine
     *  ~~~~~~~~~~~~~
     */
    var Machine = Interface(null, [Ticker]);

    /**
     *  Get current state
     *
     * @return {State}
     */
    Machine.prototype.getCurrentState = function () {};

    /**
     *  Change current state to 'default'
     */
    Machine.prototype.start = function () {};

    /**
     *  Change current state to null
     */
    Machine.prototype.stop = function () {};

    /**
     *  Pause machine, current state not change
     */
    Machine.prototype.pause = function () {};

    /**
     *  Resume machine with current state
     */
    Machine.prototype.resume = function () {};

    //-------- namespace --------
    ns.Context    = Context;
    ns.Transition = Transition;
    ns.State      = State;
    ns.Delegate   = Delegate;
    ns.Machine    = Machine;

})(FiniteStateMachine, MONKEY);
