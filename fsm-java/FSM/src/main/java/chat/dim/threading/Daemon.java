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

import chat.dim.type.Duration;

public class Daemon {

    private final Runnable runnable;
    private final boolean daemonic;

    private Thread thread;

    public Daemon(Runnable target, boolean on) {
        super();
        runnable = target;
        daemonic = on;
        thread = null;
    }
    public Daemon(Runnable target) {
        this(target, true);
    }

    public boolean isAlive() {
        Thread thr = thread;
        return thr != null && thr.isAlive();
    }

    public void start() {
        forceStop();
        Thread thr = new Thread(runnable);
        thr.setDaemon(daemonic);
        thr.start();
        thread = thr;
    }

    public void stop() {
        forceStop();
    }

    private void forceStop() {
        Thread thr = thread;
        if (thr != null) {
            thread = null;
            join(thr);
        }
    }

    protected void join(Thread thr) {
        // Waits at most milliseconds for this thread to die.
        // A timeout of 0 means to wait forever.
        join(thr, 1024);
    }

    public static void join(Thread thr, long millis) {
        try {
            thr.join(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public static void join(Thread thr, Duration waiting) {
        join(thr, waiting.inMilliseconds());
    }

}
