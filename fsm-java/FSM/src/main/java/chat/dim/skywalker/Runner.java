/* license: https://mit-license.org
 *
 *  Finite State Machine
 *
 *                                Written in 2021 by Moky <albert.moky@gmail.com>
 *
 * ==============================================================================
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Albert Moky
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
package chat.dim.skywalker;

import chat.dim.type.Duration;

public abstract class Runner implements Runnable, Handler, Processor {

    /**
     *  Frames Per Second
     *  ~~~~~~~~~~~~~~~~~
     *  (1) The human eye can process 10-12 still images per second,
     *      and the dynamic compensation function can also deceive us.
     *  (2) At a frame rate of 12fps or lower, we can quickly distinguish between
     *      a pile of still images and not animations.
     *  (3) Once the playback rate (frames per second) of the images reaches 16-24 fps,
     *      our brain will assume that these images are a continuously moving scene
     *      and will appear like the effect of a movie.
     *  (4) At 24fps, there is a feeling of 'motion blur',
     *      while at 60fps, the image is the smoothest and cleanest.
     */
    public static Duration INTERVAL_SLOW   = Duration.ofMilliseconds(Duration.MILLIS_PER_SECOND / 10);  // 100 ms
    public static Duration INTERVAL_NORMAL = Duration.ofMilliseconds(Duration.MILLIS_PER_SECOND / 25);  //  40 ms
    public static Duration INTERVAL_FAST   = Duration.ofMilliseconds(Duration.MILLIS_PER_SECOND / 60);  //  16 ms

    protected Runner(Duration interval) {
        assert interval.isPositive() : "interval error: " + interval;
        this.interval = interval;
    }

    public final Duration interval;
    private boolean running = false;

    public boolean isRunning() {
        return running;
    }

    public void stop() {
        running = false;
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

    @Override
    public void setup() {
        running = true;
    }

    @Override
    public void handle() {
        while (isRunning()) {
            if (process()) {
                // process() return true,
                // means this thread is busy,
                // so process next task immediately
            } else {
                // nothing to do now,
                // have a rest ^_^
                idle();
            }
        }
    }

    @Override
    public void finish() {
        running = false;
    }

    protected void idle() {
        sleep(interval);
    }

    public static void sleep(Duration interval) {
        sleep(interval.inMilliseconds());
    }

    public static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

}
