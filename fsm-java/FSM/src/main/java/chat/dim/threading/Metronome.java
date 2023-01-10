/* license: https://mit-license.org
 *
 *  Finite State Machine
 *
 *                                Written in 2022 by Moky <albert.moky@gmail.com>
 *
 * ==============================================================================
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Albert Moky
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ==============================================================================
 */
package chat.dim.threading;

import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import chat.dim.skywalker.Runner;
import chat.dim.type.WeakSet;

public class Metronome extends Runner {

    // at least wait 0.1 second
    public static long MIN_INTERVAL = 100;

    private final long interval;
    private long lastTime;

    private final Daemon daemon;

    private final ReadWriteLock lock;
    private final Set<Ticker> allTickers;

    public Metronome(long millis) {
        super();
        assert millis > 0 : "interval error: " + millis;
        interval = millis;
        lastTime = 0;
        daemon = new Daemon(this);
        lock = new ReentrantReadWriteLock();
        allTickers = new WeakSet<>();
    }

    @Override
    public void setup() {
        super.setup();
        lastTime = System.currentTimeMillis();
    }

    @Override
    public boolean process() {
        Ticker[] tickers = getTickers();
        if (tickers.length == 0) {
            // nothing to do now,
            // return false to have a rest ^_^
            return false;
        }
        // 1. check time
        long now = System.currentTimeMillis();
        long elapsed = now - lastTime;
        long waiting = interval - elapsed;
        if (waiting < MIN_INTERVAL) {
            waiting = MIN_INTERVAL;
        }
        idle(waiting);
        now += waiting;
        elapsed += waiting;
        // 2. drive tickers
        for (Ticker item : tickers) {
            try {
                item.tick(now, elapsed);
            } catch (Throwable e) {
                e.printStackTrace();
            }
        }
        // 3. update last time
        lastTime = now;
        return true;
    }

    private Ticker[] getTickers() {
        Ticker[] tickers;
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
            tickers = allTickers.toArray(new Ticker[0]);
        } finally {
            writeLock.unlock();
        }
        return tickers;
    }

    public void addTicker(Ticker ticker) {
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
            allTickers.add(ticker);
        } finally {
            writeLock.unlock();
        }
    }

    public void removeTicker(Ticker ticker) {
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
            allTickers.remove(ticker);
        } finally {
            writeLock.unlock();
        }
    }

    public void start() {
        daemon.start();
    }
    public void stop() {
        super.stop();
        daemon.stop();
    }
}
