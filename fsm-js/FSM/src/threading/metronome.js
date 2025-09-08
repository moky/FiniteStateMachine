'use strict';
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

    fsm.threading.Metronome = function (interval) {
        Runner.call(this);
        if (!interval || interval.shorterThan(Metronome.MIN_INTERVAL)) {
            interval = Metronome.MIN_INTERVAL;
        }
        this.__interval = interval;
        this.__last_time = null;
        this.__thread = new Thread(this);
        this.__tickers = new HashSet();   // WeakSet<Ticker>
    };
    var Metronome = fsm.threading.Metronome;

    Class(Metronome, Runner, null);

    // at least wait 0.1 second
    Metronome.MIN_INTERVAL = Duration.ofMilliseconds(100);

    Metronome.prototype.start = function () {
        this.__thread.start();
    };

    Metronome.prototype.stop = function () {
        this.__thread.stop();
    };

    // Override
    Metronome.prototype.setup = function () {
        this.__last_time = new Date();
        return Runner.prototype.setup.call(this);
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
        var now = new Date();
        var elapsed = Duration.between(this.__last_time, now);
        if (elapsed.shorterThan(this.__interval)) {
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
        return this.__tickers.toArray();
    };

    /**
     *  Append ticker
     *
     * @param {Ticker} ticker
     * @return {boolean} false on already exists
     */
    Metronome.prototype.addTicker = function (ticker) {
        return this.__tickers.add(ticker);
    };

    /**
     *  Remove ticker
     *
     * @param {Ticker} ticker
     * @return {boolean} false on not exists
     */
    Metronome.prototype.removeTicker = function (ticker) {
        return this.__tickers.remove(ticker);
    };

    //
    //  Singleton
    //
    fsm.threading.PrimeMetronome = {

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
            var metronome = sharedMetronome;
            if (metronome === null) {
                var interval = Duration.ofMilliseconds(200);
                metronome = new Metronome(interval);
                metronome.start();
                sharedMetronome = metronome;
            }
            return metronome;
        }
    };
    var PrimeMetronome = fsm.threading.PrimeMetronome;

    var sharedMetronome = null;
