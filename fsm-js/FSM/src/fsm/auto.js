;
// license: https://mit-license.org
//
//  Finite State Machine
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require 'threading/metronome.js'
//! require 'base.js'

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;

    var PrimeMetronome = ns.threading.PrimeMetronome;
    var BaseMachine    = ns.BaseMachine;

    /**
     *  Create an Auto State Machine with default state name
     */
    var AutoMachine = function () {
        BaseMachine.call(this);
    };
    Class(AutoMachine, BaseMachine, null, {

        // Override
        start: function () {
            BaseMachine.prototype.start.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this);
        },

        // Override
        stop: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.stop.call(this);
        },

        // Override
        pause: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.pause.call(this);
        },

        // Override
        resume: function () {
            BaseMachine.prototype.resume.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this);
        }
    });

    //-------- namespace --------
    ns.AutoMachine = AutoMachine;

})(FiniteStateMachine, MONKEY);
