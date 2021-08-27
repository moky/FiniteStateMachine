/* license: https://mit-license.org
 *
 *  Finite State Machine
 *
 *                                Written in 2019 by Moky <albert.moky@gmail.com>
 *
 * ==============================================================================
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Albert Moky
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

/**
 *  Finite State
 *  ~~~~~~~~~~~~
 *
 * @param <C> - context
 * @param <T> - transition
 */
public interface State<C extends Context, T extends Transition<C>> {

    /**
     *  Called before entered
     *  (get current state from context)
     *
     * @param ctx - context (machine)
     */
    void onEnter(C ctx);

    /**
     *  Called after exited
     *  (get current state from context)
     *
     * @param ctx - context (machine)
     */
    void onExit(C ctx);

    /**
     *  Called before paused
     *
     * @param ctx - context (machine)
     */
    void onPause(C ctx);

    /**
     *  Called after resumed
     *
     * @param ctx - context (machine)
     */
    void onResume(C ctx);

    /**
     *  Called by machine.tick() to evaluate each transitions
     *
     * @param ctx - context (machine)
     * @return success transition, or null to stay the current state
     */
    T evaluate(C ctx);
}
