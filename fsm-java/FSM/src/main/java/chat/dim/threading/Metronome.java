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

import java.util.Collections;
import java.util.Set;
import java.util.WeakHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

class WeakSet {
    static <E> Set<E> newSet() {
        return Collections.newSetFromMap(new WeakHashMap<>());
    }
}

public class Metronome implements Runnable {

    //
    //  Singleton
    //
    public static Metronome getInstance() {
        return SingletonInstance.INSTANCE;
    }
    private static class SingletonInstance {
        private static final Metronome INSTANCE;
        static {
            INSTANCE = new Metronome();
            INSTANCE.start();
        }
    }
    private Metronome() {
        super();
    }

    //
    //  Running as daemon
    //
    private final Daemon daemon = new Daemon(this);
    private boolean running = false;

    public void start() {
        if (!running) {
            running = true;
            daemon.start();
        }
    }
    public void stop() {
        if (running) {
            running = false;
            daemon.stop();
        }
    }

    //
    //  Lock for adding/removing ticker
    //
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    private final Set<Ticker> adding = WeakSet.newSet();
    private final Set<Ticker> removing = WeakSet.newSet();

    private final Set<Ticker> tickers = WeakSet.newSet();

    public void add(Ticker ticker) {
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
            removing.remove(ticker);
            adding.add(ticker);
        } finally {
            writeLock.unlock();
        }
    }

    public void remove(Ticker ticker) {
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
            adding.remove(ticker);
            removing.add(ticker);
        } finally {
            writeLock.unlock();
        }
    }

    private Set<Ticker> getTickers() {
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
            if (adding.size() > 0) {
                tickers.addAll(adding);
                adding.clear();
            }
            if (removing.size() > 0) {
                tickers.removeAll(removing);
                removing.clear();
            }
        } finally {
            writeLock.unlock();
        }
        // OK
        return tickers;
    }

    //
    //  Drive
    //

    private void drive(long now, long delta) {
        Set<Ticker> candidates = getTickers();
        for (Ticker item : candidates) {
            try {
                item.tick(now, delta);
            } catch (Throwable e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void run() {
        long now = System.currentTimeMillis();
        long last;
        long delta = 0;
        while (running) {
            // 1. drive all tickers with timestamp
            try {
                drive(now, delta);
            } catch (Throwable e) {
                e.printStackTrace();
            }
            // 2. get new timestamp
            last = now;
            now = System.currentTimeMillis();
            delta = now - last;
            if (delta < MIN_DELTA) {
                // 3. too frequently
                idle(MAX_DELTA - delta);
                now = System.currentTimeMillis();
                delta = now - last;
            }
        }
    }
    private static void idle(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public long MIN_DELTA = 100;
    public long MAX_DELTA = 128;
}
