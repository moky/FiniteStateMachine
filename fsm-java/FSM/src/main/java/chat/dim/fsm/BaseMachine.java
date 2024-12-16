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

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public abstract class BaseMachine<C extends Context, T extends BaseTransition<C>, S extends BaseState<C, T>>
        implements Machine<C, T, S> {

    private final List<S> states = new ArrayList<>();
    private int current = -1;  // current state index

    private Status status = Status.Stopped;
    private WeakReference<Delegate<C, T, S>> delegateRef = null;

    public void setDelegate(Delegate<C, T, S> delegate) {
        delegateRef = delegate == null ? null : new WeakReference<>(delegate);
    }
    protected Delegate<C, T, S> getDelegate() {
        WeakReference<Delegate<C, T, S>> ref = delegateRef;
        return ref == null ? null : ref.get();
    }

    // the machine itself
    protected abstract C getContext();

    //
    //  States
    //
    public S addState(S newState) {
        int index = newState.index;
        assert index >= 0 : "state index error: " + index;
        if (index < states.size()) {
            // WARNING: return old state that was replaced
            return states.set(index, newState);
        }
        // filling empty spaces
        int spaces = index - states.size();
        for (int i = 0; i < spaces; ++i) {
            states.add(null);
        }
        // append the new state to the tail
        states.add(newState);
        return null;
    }
    public S getState(int index) {
        return states.get(index);
    }

    protected S getDefaultState() {
        assert states.size() > 0 : "states not set yet";
        return states.get(0);
    }
    protected S getTargetState(T transition) {
        // Get target state of this transition
        return states.get(transition.target);
    }
    @Override
    public S getCurrentState() {
        if (current < 0) {  // -1
            return null;
        }
        return states.get(current);
    }
    private void setCurrentState(S newState) {
        if (newState == null) {
            current = -1;
        } else {
            current = newState.index;
        }
    }

    /**
     *  Exit current state, and enter new state
     *
     * @param newState - next state
     * @param now     - current time
     */
    private boolean changeState(S newState, Date now) {
        S oldState = getCurrentState();
        if (oldState == null) {
            if (newState == null) {
                // state not change
                return false;
            }
        } else if (oldState.equals(newState)) {
            // state not change
            return false;
        }

        C ctx = getContext();
        Delegate<C, T, S> delegate = getDelegate();

        //
        //  Events before state changed
        //
        if (delegate != null) {
            // prepare for changing current state to the new one,
            // the delegate can get old state via ctx if need
            delegate.enterState(newState, ctx, now);
        }
        if (oldState != null) {
            oldState.onExit(newState, ctx, now);
        }

        //
        //  Change current state
        //
        setCurrentState(newState);

        //
        //  Events after state changed
        //
        if (newState != null) {
            newState.onEnter(oldState, ctx, now);
        }
        if (delegate != null) {
            // handle after the current state changed,
            // the delegate can get new state via ctx if need
            delegate.exitState(oldState, ctx, now);
        }

        return true;
    }

    //
    //  Actions
    //

    /**
     *  start machine from default state
     */
    @Override
    public boolean start() {
        if (status != Status.Stopped) {
            // Running or Paused,
            // cannot start again
            return false;
        }
        Date now = new Date();
        boolean ok = changeState(getDefaultState(), now);
        //assert ok : "failed to change default state";
        status = Status.Running;
        return ok;
    }

    /**
     *  stop machine and set current state to null
     */
    @Override
    public boolean stop() {
        if (status == Status.Stopped) {
            // Stopped,
            // cannot stop again
            return false;
        }
        status = Status.Stopped;
        Date now = new Date();
        return changeState(null, now);  // force current state to null
    }

    /**
     *  pause machine, current state not change
     */
    @Override
    public boolean pause() {
        if (status != Status.Running) {
            // Paused or Stopped,
            // cannot pause now
            return false;
        }
        Date now = new Date();
        C ctx = getContext();
        S current = getCurrentState();
        Delegate<C, T, S> delegate = getDelegate();
        //
        //  Events before state paused
        //
        if (current != null) {
            current.onPause(ctx, now);
        }
        //
        //  Pause current state
        //
        status = Status.Paused;
        //
        //  Events after state paused
        //
        if (delegate != null) {
            delegate.pauseState(current, ctx, now);
        }
        return true;
    }

    /**
     *  resume machine with current state
     */
    @Override
    public boolean resume() {
        if (status != Status.Paused) {
            // Running or Stopped,
            // cannot resume now
            return false;
        }
        Date now = new Date();
        C ctx = getContext();
        S current = getCurrentState();
        Delegate<C, T, S> delegate = getDelegate();
        //
        //  Events before state resumed
        //
        if (delegate != null) {
            delegate.resumeState(current, ctx, now);
        }
        //
        //  Resume current state
        //
        status = Status.Running;
        //
        //  Events after state resumed
        //
        if (current != null) {
            current.onResume(ctx, now);
        }
        return true;
    }

    //
    //  Ticker
    //

    /**
     *  Drive the machine running forward
     */
    @Override
    public void tick(Date now, long elapsed) {
        if (status != Status.Running) {
            // Paused or Stopped,
            // cannot evaluate the transitions of current state
            return;
        }
        S state = getCurrentState();
        if (state != null) {
            C ctx = getContext();
            T transition = state.evaluate(ctx, now);
            if (transition != null) {
                state = getTargetState(transition);
                assert state != null : "state error: " + transition;
                changeState(state, now);
            }
        }
    }

}
