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

//! require 'runner.js'
//! require 'ticker.js'
//! require 'thread.js'

(function (ns, sys) {
    'use strict';

    var Class = sys.type.Class;

    var Runner = ns.skywalker.Runner;
    var Thread = ns.threading.Thread;

    var Metronome = function (millis) {
        Runner.call(this);
        if (millis < Metronome.MIN_INTERVAL) {
            millis = Metronome.MIN_INTERVAL;
        }
        this.__interval = millis;
        this.__last_time = 0;  // milliseconds
        this.__thread = new Thread(this);
        this.__tickers = [];   // WeakSet<Ticker>
    };
    Class(Metronome, Runner, null, null);

    // at least wait 0.1 second
    Metronome.MIN_INTERVAL = 100;

    Metronome.prototype.start = function () {
        this.__thread.start();
    };

    Metronome.prototype.stop = function () {
        this.__thread.stop();
    };

    // Override
    Metronome.prototype.setup = function () {
        this.__last_time = (new Date()).getTime();
        return false;
    };

    // Override
    Metronome.prototype.process = function () {
        var tickers = this.getTickers();
        if (tickers.length === 0) {
            // nothing to do now,
            // return false to have a rest ^_^
            return false;
        }
        // 1. check time
        var now = (new Date()).getTime();
        var elapsed = now - this.__last_time;
        if (elapsed < this.__interval) {
            // idle(waiting);
            return false;
        }
        // 2. drive all tickers
        for (var i = tickers.length - 1; i >= 0; --i) {
            try {
                tickers[i].tick(now, elapsed);
            } catch (e) {
                //console.error('Metronome::process() error', this, e);
            }
        }
        // 3. update last time
        this.__last_time = now;
        return true;
    };

    Metronome.prototype.getTickers = function () {
        return this.__tickers.slice();
    };

    /**
     *  Append ticker
     *
     * @param {Ticker} ticker
     * @return {boolean} false on already exists
     */
    Metronome.prototype.addTicker = function (ticker) {
        if (this.__tickers.indexOf(ticker) < 0) {
            this.__tickers.push(ticker);
            return true;
        } else {
            return false;
        }
    };

    /**
     *  Remove ticker
     *
     * @param {Ticker} ticker
     * @return {boolean} false on not exists
     */
    Metronome.prototype.removeTicker = function (ticker) {
        var index = this.__tickers.indexOf(ticker);
        if (index < 0) {
            return false;
        } else {
            this.__tickers.splice(index, 1);
            return true;
        }
    };

    //
    //  Singleton
    //
    var PrimeMetronome = {

        /**
         *  Append ticker
         *
         * @param {Ticker} ticker
         * @return {boolean} false on already exists
         */
        addTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.addTicker(ticker);
        },

        /**
         *  Remove ticker
         *
         * @param {Ticker} ticker
         * @return {boolean} false on not exists
         */
        removeTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.removeTicker(ticker);
        },

        getInstance: function () {
            var metronome = this.__sharedMetronome;
            if (metronome === null) {
                metronome = new Metronome(200);
                metronome.start();
                this.__sharedMetronome = metronome;
            }
            return metronome;
        },
        __sharedMetronome: null
    };

    //-------- namespace --------
    ns.threading.Metronome = Metronome;
    ns.threading.PrimeMetronome = PrimeMetronome;

})(FiniteStateMachine, MONKEY);
