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

import chat.dim.threading.PrimeMetronome;

public abstract class AutoMachine<C extends Context, T extends BaseTransition<C>, S extends BaseState<C, T>>
        extends BaseMachine<C, T, S> {

    @Override
    public boolean start() {
        boolean ok = super.start();
        PrimeMetronome timer = PrimeMetronome.getInstance();
        timer.addTicker(this);
        return ok;
    }

    @Override
    public boolean stop() {
        PrimeMetronome timer = PrimeMetronome.getInstance();
        timer.removeTicker(this);
        return super.stop();
    }

    @Override
    public boolean pause() {
        PrimeMetronome timer = PrimeMetronome.getInstance();
        timer.removeTicker(this);
        return super.pause();
    }

    @Override
    public boolean resume() {
        boolean ok = super.resume();
        PrimeMetronome timer = PrimeMetronome.getInstance();
        timer.addTicker(this);
        return ok;
    }
}
