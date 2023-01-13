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
import java.util.HashMap;
import java.util.Map;

public abstract class BaseMachine<C extends Context, T extends BaseTransition<C>, S extends State<C, T>>
        implements Machine<C, T, S> {

    private final Map<String, S> stateMap = new HashMap<>();
    private final String defaultStateName;
    private WeakReference<S> currentStateRef;

    private Status status;
    private WeakReference<Delegate<C, T, S>> delegateRef;

    public BaseMachine(String defaultState) {
        super();
        defaultStateName = defaultState;
        currentStateRef = null;
        status = Status.Stopped;
        delegateRef = new WeakReference<>(null);
    }

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
    public void setState(String name, S state) {
        stateMap.put(name, state);
    }
    public S getState(String name) {
        return stateMap.get(name);
    }

    protected S getDefaultState() {
        return stateMap.get(defaultStateName);
    }
    protected S getTargetState(T transition) {
        // Get target state of this transition
        return stateMap.get(transition.target);
    }
    @Override
    public S getCurrentState() {
        WeakReference<S> ref = currentStateRef;
        return ref == null ? null : ref.get();
    }
    private void setCurrentState(S newState) {
        currentStateRef = newState == null ? null : new WeakReference<>(newState);
    }

    /**
     *  Exit current state, and enter new state
     *
     * @param newState - next state
     */
    private boolean changeState(S newState, long now, long elapsed) {
        S oldState = getCurrentState();
        if (oldState == null) {
            if (newState == null) {
                // state not chang
                return false;
            }
        } else if (oldState.equals(newState)) {
            // state not chang
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
            delegate.enterState(newState, ctx);
        }
        if (oldState != null) {
            oldState.onExit(newState, ctx, now, elapsed);
        }

        //
        //  Change current state
        //
        setCurrentState(newState);

        //
        //  Events after state changed
        //
        if (newState != null) {
            newState.onEnter(oldState, ctx, now, elapsed);
        }
        if (delegate != null) {
            // handle after the current state changed,
            // the delegate can get new state via ctx if need
            delegate.exitState(oldState, ctx);
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
    public void start() {
        long now = System.currentTimeMillis();
        boolean ok = changeState(getDefaultState(), now, 0);
        assert ok : "failed to change default state";
        status = Status.Running;
    }

    /**
     *  stop machine and set current state to null
     */
    @Override
    public void stop() {
        status = Status.Stopped;
        changeState(null, 0, 0);  // force current state to null
    }

    /**
     *  pause machine, current state not change
     */
    @Override
    public void pause() {
        C ctx = getContext();
        S current = getCurrentState();
        Delegate<C, T, S> delegate = getDelegate();
        //
        //  Events before state paused
        //
        if (current != null) {
            current.onPause(ctx);
        }
        //
        //  Pause current state
        //
        status = Status.Paused;
        //
        //  Events after state paused
        //
        if (delegate != null) {
            delegate.pauseState(current, ctx);
        }
    }

    /**
     *  resume machine with current state
     */
    @Override
    public void resume() {
        C ctx = getContext();
        S current = getCurrentState();
        Delegate<C, T, S> delegate = getDelegate();
        //
        //  Events before state resumed
        //
        if (delegate != null) {
            delegate.resumeState(current, ctx);
        }
        //
        //  Resume current state
        //
        status = Status.Running;
        //
        //  Events after state resumed
        //
        if (current != null) {
            current.onResume(ctx);
        }
    }

    //
    //  Ticker
    //

    /**
     *  Drive the machine running forward
     */
    @Override
    public void tick(long now, long elapsed) {
        C ctx = getContext();
        S state = getCurrentState();
        if (state != null && status == Status.Running) {
            T transition = state.evaluate(ctx, now, elapsed);
            if (transition != null) {
                state = getTargetState(transition);
                assert state != null : "state error: " + transition;
                changeState(state, now, elapsed);
            }
        }
    }
}
