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
//! require 'state.js'

(function (ns, sys) {
    "use strict";

    /**
     *  State Machine Delegate
     *  ~~~~~~~~~~~~~~~~~~~~~~
     */
    var Delegate = function () {};
    sys.Interface(Delegate, null);

    /**
     *  Called before enter new state
     *  (get current state from context)
     *
     * @param {State} next - new state
     * @param {Context} machine
     */
    Delegate.prototype.enterState = function (next, machine) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Called after exit old state
     *  (get current state from context)
     *
     * @param {State} previous - old state
     * @param {Context} machine
     */
    Delegate.prototype.exitState = function (previous, machine) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Called before pause this state
     *
     * @param {State} current - current state
     * @param {Context} machine
     */
    Delegate.prototype.pauseState = function (current, machine) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Called after resume this state
     *
     * @param {State} current - current state
     * @param {Context} machine
     */
    Delegate.prototype.resumeState = function (current, machine) {
        ns.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.Delegate = Delegate;

    ns.registers('Delegate');

})(FiniteStateMachine, MONKEY);