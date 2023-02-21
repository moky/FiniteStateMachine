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
//! require 'handler.js'
//! require 'processor.js'

(function (ns, sys) {
    'use strict';

    var Class = sys.type.Class;

    var Runnable  = ns.skywalker.Runnable;
    var Handler   = ns.skywalker.Handler;
    var Processor = ns.skywalker.Processor;

    var STAGE_INIT = 0;      // calling setup()
    var STAGE_HANDLING = 1;  // calling handle()
    var STAGE_CLEANING = 2;  // calling finish()
    var STAGE_STOPPED = 3;

    var Runner = function () {
        Object.call(this);
        this.__running = false;
        this.__stage = STAGE_INIT;
    };
    Class(Runner, Object, [Runnable, Handler, Processor], {

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
                    //console.error('Runner::handle() error', this, e);
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
            this.__running = true;
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
        }
    });

    Runner.prototype.isRunning = function () {
        return this.__running;
    };

    Runner.prototype.stop = function () {
        this.__running = false;
    };

    //-------- namespace --------
    ns.skywalker.Runner = Runner;

})(FiniteStateMachine, MONKEY);
