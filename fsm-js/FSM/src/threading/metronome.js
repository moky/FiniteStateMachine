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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var Runnable = ns.threading.Runnable;
    var Thread = ns.threading.Thread;

    var Metronome = function () {
        Object.call(this);
        this.__tickers = [];
        this.__last_time = 0;  // milliseconds
        this.__thread = null;
    };
    ns.Class(Metronome, Object, [Runnable], null);

    Metronome.MIN_DELTA = 100;

    Metronome.prototype.start = function () {
        this.__last_time = (new Date()).getTime();
        var thread = new Thread(this);
        this.__thread = thread;
        thread.start();
    };

    Metronome.prototype.stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop();
        }
    };

    // Override
    Metronome.prototype.run = function () {
        var now = (new Date()).getTime();
        var delta = now - this.__last_time;
        if (delta > Metronome.MIN_DELTA) {
            try {
                var tickers = new Array(this.__tickers);
                drive(tickers, now, delta);
            } catch (e) {
                ns.error('Metronome::run()', e);
            }
            this.__last_time = now;
        }
        return true;  // true for continuous
    };

    var drive = function (tickers, now, delta) {
        for (var index = 0; index < tickers.length; ++index) {
            try {
                tickers[index].tick(now, delta);
            } catch (e) {
                ns.error('Ticker::tick()', e);
            }
        }
    };

    /**
     *  Append ticker
     *
     * @param {Ticker} ticker
     */
    Metronome.prototype.addTicker = function (ticker) {
        if (this.__tickers.indexOf(ticker) < 0) {
            this.__tickers.push(ticker);
        } else {
            throw new Error('ticker exists: ' + ticker);
        }
    };

    /**
     *  Remove ticker
     *
     * @param {Ticker} ticker
     */
    Metronome.prototype.removeTicker = function (ticker) {
        var index = this.__tickers.indexOf(ticker);
        if (index >= 0) {
            this.__tickers.splice(index, 1);
        }
    };

    //
    //  Singleton
    //
    Metronome.getInstance = function () {
        if (!sharedMetronome) {
            sharedMetronome = new Metronome();
            sharedMetronome.start();
        }
        return sharedMetronome;
    };
    var sharedMetronome = null;

    //-------- namespace --------
    ns.threading.Metronome = Metronome;

    ns.threading.registers('Metronome');

})(MONKEY);
