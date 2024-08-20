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

import java.util.Date;

/**
 *  State Machine Delegate
 *  ~~~~~~~~~~~~~~~~~~~~~~
 */
public interface Delegate<C extends Context, T extends Transition<C>, S extends State<C, T>> {

    /**
     *  Called before new state entered
     *  (get current state from context)
     *
     * @param next     - new state
     * @param ctx      - context (machine)
     * @param now      - current time
     */
    void enterState(S next, C ctx, Date now);

    /**
     *  Called after old state exited
     *  (get current state from context)
     *
     * @param previous - old state
     * @param ctx      - context (machine)
     * @param now      - current time
     */
    void exitState(S previous, C ctx, Date now);

    /**
     *  Called after current state paused
     *
     * @param current  - current state
     * @param ctx      - context (machine)
     * @param now      - current time
     */
    void pauseState(S current, C ctx, Date now);

    /**
     *  Called before current state resumed
     *
     * @param current  - current state
     * @param ctx      - context (machine)
     * @param now      - current time
     */
    void resumeState(S current, C ctx, Date now);
}
