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

    private Status status = Status.Stopped;

    private WeakReference<Delegate<C, T, S>> delegateRef = null;

    private final Map<String, S> stateMap = new HashMap<>();
    private final String defaultStateName;
    private S currentState = null;

    public BaseMachine(String defaultState) {
        super();
        defaultStateName = defaultState;
    }

    public void setDelegate(Delegate<C, T, S> delegate) {
        if (delegate == null) {
            delegateRef = null;
        } else {
            delegateRef = new WeakReference<>(delegate);
        }
    }
    public Delegate<C, T, S> getDelegate() {
        if (delegateRef == null) {
            return null;
        } else {
            return delegateRef.get();
        }
    }

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

    @Override
    public S getDefaultState() {
        return stateMap.get(defaultStateName);
    }
    @Override
    public S getTargetState(T transition) {
        return stateMap.get(transition.target);
    }
    @Override
    public S getCurrentState() {
        return currentState;
    }
    @Override
    public void setCurrentState(S newState) {
        currentState = newState;
    }

    @Override
    public boolean changeState(S newState) {
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

        // events before state changed
        if (delegate != null) {
            delegate.enterState(newState, ctx);
        }
        if (newState != null) {
            newState.onEnter(ctx);
        }

        // change state
        setCurrentState(newState);

        // events after state changed
        if (delegate != null) {
            delegate.exitState(oldState, ctx);
        }
        if (oldState != null) {
            oldState.onExit(ctx);
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
        changeState(getDefaultState());
        status = Status.Running;
    }

    /**
     *  stop machine and set current state to null
     */
    @Override
    public void stop() {
        status = Status.Stopped;
        changeState(null);
    }

    /**
     *  pause machine, current state not change
     */
    @Override
    public void pause() {
        C ctx = getContext();
        S currentState = getCurrentState();
        // events before state paused
        Delegate<C, T, S> delegate = getDelegate();
        if (delegate != null) {
            delegate.pauseState(currentState, ctx);
        }
        currentState.onPause(ctx);
        // pause state
        status = Status.Paused;
    }

    /**
     *  resume machine with current state
     */
    @Override
    public void resume() {
        C ctx = getContext();
        S currentState = getCurrentState();
        // reuse state
        status = Status.Running;
        // events after state resumed
        Delegate<C, T, S> delegate = getDelegate();
        if (delegate != null) {
            delegate.resumeState(currentState, ctx);
        }
        currentState.onResume(ctx);
    }

    //
    //  Ticker
    //

    /**
     *  Drive the machine running forward
     */
    @Override
    public void tick() {
        C ctx = getContext();
        S state = getCurrentState();
        if (state != null && status == Status.Running) {
            T transition = state.evaluate(ctx);
            if (transition != null) {
                state = getTargetState(transition);
                assert state != null : "state error: " + transition;
                changeState(state);
            }
        }
    }
}
