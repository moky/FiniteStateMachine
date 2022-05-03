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

//! require 'threading/thread.js'
//! require 'handler.js'
//! require 'processor.js'

(function (ns) {
    'use strict';

    var Thread = ns.threading.Thread;
    var Handler = ns.threading.Handler;
    var Processor = ns.threading.Processor;

    var STAGE_INIT = 0;      // calling setup()
    var STAGE_HANDLING = 1;  // calling handle()
    var STAGE_CLEANING = 2;  // calling finish()
    var STAGE_STOPPED = 3;

    /**
     *  Create Runner for processing
     *
     *  Usages:
     *      1. new Runner();
     *      2. new Runner(processor);
     *      3. new Runner(interval);
     *      4. new Runner(processor, interval);
     */
    var Runner = function () {
        if (arguments.length === 0) {
            // new Runner();
            Thread.call(this);
            this.__processor = null;
        } else if (arguments.length === 2) {
            // new Runner(processor, interval);
            Thread.call(this, arguments[1]);
            this.__processor = arguments[0];
        } else if (typeof arguments[0] === 'number') {
            // new Runner(interval);
            Thread.call(this, arguments[0]);
            this.__processor = null;
        } else {
            // new Runner(processor);
            Thread.call(this);
            this.__processor = arguments[0];
        }
        this.__stage = STAGE_INIT;
    };
    ns.Class(Runner, Thread, [Handler, Processor], {
        // Override
        run: function () {
            // this.setup();
            // try {
            //     this.handle();
            // } finally {
            //     this.finish();
            // }
            if (this.__stage === STAGE_INIT) {
                if (this.setup()) {
                    // setting not finished yet, sleep a while and do it again
                    return true;
                }
                // setting finished, move on
                this.__stage = STAGE_HANDLING;
            }
            if (this.__stage === STAGE_HANDLING) {
                try {
                    if (this.handle()) {
                        // handling not finished, sleep a while and do again
                        return true;
                    }
                } catch (e) {
                    ns.error('Runner::handle() error', this, e);
                }
                // handling finished(or error), move on
                this.__stage = STAGE_CLEANING;
            }
            if (this.__stage === STAGE_CLEANING) {
                if (this.finish()) {
                    // cleaning not finished, sleep a while and call again
                    return true;
                }
                // closing finished, move on
                this.__stage = STAGE_STOPPED;
            }
            // all jobs done, return false to stop running
            return false;
        },

        //-------- Handler

        // Override
        setup: function () {
            // TODO: override for preparing
            return false;
        },

        // Override
        handle: function () {
            while (this.isRunning()) {
                // process one job
                if (this.process()) {
                    // one job processed, still have job(s) waiting
                    // continue to do it again immediately
                } else {
                    // no more job waiting now,
                    // return true to try it again after a while
                    return true;
                }
            }
            // stopped, return false to exit handling
            return false;
        },

        // Override
        finish: function () {
            // TODO: override to cleanup
            return false;
        },

        //-------- Processor

        // Override
        process: function () {
            var processor = this.__processor;
            if (!processor || processor === this) {
                throw new SyntaxError('Runner::process() > override me!');
            } else {
                return processor.process();
            }
        }
    });

    //-------- namespace --------
    ns.skywalker.Runner = Runner;

    ns.skywalker.registers('Runner');

})(MONKEY);
