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

    var Ticker = sys.threading.Ticker;

    var Machine = function () {};
    sys.Interface(Machine, [Ticker]);

    /**
     *  Get default state
     *
     * @return {State}
     */
    Machine.prototype.getDefaultState = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get target state of transition
     *
     * @param {Transition} transition - success transition
     * @return {State}
     */
    Machine.prototype.getTargetState = function (transition) {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get current state
     *
     * @return {State}
     */
    Machine.prototype.getCurrentState = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Set current state
     *
     * @param {State} state - new state
     */
    Machine.prototype.setCurrentState = function (state) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Exit current state, and enter new state
     *
     * @param {State} state - next state
     * @return {boolean} true on state changed
     */
    Machine.prototype.changeState = function (state) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Change current state to 'default'
     */
    Machine.prototype.start = function () {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Change current state to null
     */
    Machine.prototype.stop = function () {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Pause machine, current state not change
     */
    Machine.prototype.pause = function () {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Resume machine with current state
     */
    Machine.prototype.resume = function () {
        ns.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.Machine = Machine;

    ns.registers('Machine');

})(FiniteStateMachine, MONKEY);
