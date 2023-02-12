;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2022 Albert Moky
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

//! require 'runnable.js'

(function (ns, sys) {
    'use strict';

    var Interface = sys.type.Interface;
    var Class = sys.type.Class;

    var Runnable = ns.skywalker.Runnable;

    /**
     *  Create Thread for runnable target
     *
     *  Usages:
     *      1. new Thread();
     *      2. new Thread(runnable);
     */
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            // new Thread();
            this.__target = null;
        } else {
            // new Thread(runnable);
            this.__target = arguments[0];
        }
        this.__running = false;
    };
    Class(Thread, Object, [Runnable], null);

    Thread.INTERVAL = 256;  // milliseconds

    /**
     *  Start running
     */
    Thread.prototype.start = function () {
        this.__running = true;
        run(this);
    };
    var run = function (thread) {
        var running = thread.isRunning() && thread.run();
        if (running) {
            // next step
            setTimeout(function () { run(thread); }, Thread.INTERVAL);
        }
    };

    /**
     *  Check whether thread is running
     *
     * @return {boolean} false on stopped
     */
    Thread.prototype.isRunning = function () {
        return this.__running;
    };

    // return true for sleeping a while to continued
    // false to stop
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError('Thread::run() > override me!');
        } else if (typeof target === 'function') {
            return target();
        } else if (Interface.conforms(target, Runnable)) {
            return target.run();
        } else {
            throw new SyntaxError('Thread::run() > target is not runnable: ' + target);
        }
    };

    /**
     *  Stop running
     */
    Thread.prototype.stop = function () {
        this.__running = false;
    };

    //-------- namespace --------
    ns.threading.Thread = Thread;

})(FiniteStateMachine, MONKEY);
