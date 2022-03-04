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

public abstract class AutoMachine<C extends Context, T extends BaseTransition<C>, S extends State<C, T>>
        extends BaseMachine<C, T, S> implements Runnable {

    private Thread thread = null;
    private boolean running = false;
    private boolean daemon = false;

    public AutoMachine(String defaultState, boolean isDaemon) {
        super(defaultState);
        daemon = isDaemon;
    }

    public AutoMachine(String defaultState) {
        super(defaultState);
    }

    public boolean isRunning() {
        return running;
    }

    @Override
    public void start() {
        restart();
        super.start();
    }

    private void restart() {
        forceStop();
        running = true;
        Thread thr = new Thread(this);
        thread = thr;
        thr.setDaemon(daemon);
        thr.start();
    }

    private void forceStop() {
        running = false;
        Thread thr = thread;
        if (thr != null) {
            thread = null;
            // waiting 2 seconds for stopping the thread
            //thr.join(2000);
            if (thr.isAlive()) {
                thr.interrupt();
            }
        }
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
