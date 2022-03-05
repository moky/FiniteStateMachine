/* license: https://mit-license.org
 *
 *  Finite State Machine
 *
 *                                Written in 2020 by Moky <albert.moky@gmail.com>
 *
 * ==============================================================================
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Albert Moky
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
package chat.dim.fsm;

import chat.dim.threading.Daemon;

public abstract class AutoMachine<C extends Context, T extends BaseTransition<C>, S extends State<C, T>>
        extends BaseMachine<C, T, S> implements Runnable {

    private final Daemon daemon;
    private boolean running;

    public AutoMachine(String defaultState, boolean isDaemon) {
        super(defaultState);
        daemon = new Daemon(this, isDaemon);
        running = false;
    }

    public AutoMachine(String defaultState) {
        super(defaultState);
        daemon = new Daemon(this);
        running = false;
    }

    public boolean isRunning() {
        return running;
    }

    private void forceStop() {
        running = false;
        daemon.stop();
    }
    private void restart() {
        forceStop();
        running = true;
        daemon.start();
    }

    @Override
    public void start() {
        restart();
        super.start();
    }

    @Override
    public void stop() {
        super.stop();
        forceStop();
    }

    @Override
    public void run() {
        setup();
        try {
            handle();
        } finally {
            finish();
        }
    }

    public void setup() {
        // prepare for running
    }
    public void handle() {
        while (isRunning()) {
            tick();
            idle();
        }
    }
    public void finish() {
        // clean up after running
    }

    protected void idle() {
        try {
            Thread.sleep(128);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
