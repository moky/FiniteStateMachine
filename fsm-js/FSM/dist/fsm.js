/**
 * FSM - Finite State Machine (v0.2.2)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 12, 2023
 * @copyright (c) 2023 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = {};
}
(function (ns) {
    if (typeof ns.skywalker !== "object") {
        ns.skywalker = {};
    }
    if (typeof ns.threading !== "object") {
        ns.threading = {};
    }
})(FiniteStateMachine);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Runnable = Interface(null, null);
    Runnable.prototype.run = function () {
        throw new Error("NotImplemented");
    };
    ns.skywalker.Runnable = Runnable;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Handler = Interface(null, null);
    Handler.prototype.setup = function () {
        throw new Error("NotImplemented");
    };
    Handler.prototype.handle = function () {
        throw new Error("NotImplemented");
    };
    Handler.prototype.finish = function () {
        throw new Error("NotImplemented");
    };
    ns.skywalker.Handler = Handler;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Processor = Interface(null, null);
    Processor.prototype.process = function () {
        throw new Error("NotImplemented");
    };
    ns.skywalker.Processor = Processor;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Runnable = ns.skywalker.Runnable;
    var Handler = ns.skywalker.Handler;
    var Processor = ns.skywalker.Processor;
    var STAGE_INIT = 0;
    var STAGE_HANDLING = 1;
    var STAGE_CLEANING = 2;
    var STAGE_STOPPED = 3;
    var Runner = function () {
        Object.call(this);
        this.__running = false;
        this.__stage = STAGE_INIT;
    };
    Class(Runner, Object, [Runnable, Handler, Processor], {
        run: function () {
            if (this.__stage === STAGE_INIT) {
                if (this.setup()) {
                    return true;
                }
                this.__stage = STAGE_HANDLING;
            }
            if (this.__stage === STAGE_HANDLING) {
                try {
                    if (this.handle()) {
                        return true;
                    }
                } catch (e) {}
                this.__stage = STAGE_CLEANING;
            }
            if (this.__stage === STAGE_CLEANING) {
                if (this.finish()) {
                    return true;
                }
                this.__stage = STAGE_STOPPED;
            }
            return false;
        },
        setup: function () {
            return false;
        },
        handle: function () {
            while (this.isRunning()) {
                if (this.process()) {
                } else {
                    return true;
                }
            }
            return false;
        },
        finish: function () {
            return false;
        }
    });
    ns.skywalker.Runner = Runner;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Runnable = ns.skywalker.Runnable;
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            this.__target = null;
        } else {
            this.__target = arguments[0];
        }
        this.__running = false;
    };
    Class(Thread, Object, [Runnable], null);
    Thread.INTERVAL = 256;
    Thread.prototype.start = function () {
        this.__running = true;
        run(this);
    };
    var run = function (thread) {
        var running = thread.isRunning() && thread.run();
        if (running) {
            setTimeout(function () {
                run(thread);
            }, Thread.INTERVAL);
        }
    };
    Thread.prototype.isRunning = function () {
        return this.__running;
    };
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError("Thread::run() > override me!");
        } else {
            if (typeof target === "function") {
                return target();
            } else {
                if (Interface.conforms(target, Runnable)) {
                    return target.run();
                } else {
                    throw new SyntaxError(
                        "Thread::run() > target is not runnable: " + target
                    );
                }
            }
        }
    };
    Thread.prototype.stop = function () {
        this.__running = false;
    };
    ns.threading.Thread = Thread;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Ticker = Interface(null, null);
    Ticker.prototype.tick = function (now, elapsed) {
        throw new Error("NotImplemented");
    };
    ns.threading.Ticker = Ticker;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Runner = ns.skywalker.Runner;
    var Ticker = ns.threading.Ticker;
    var Thread = ns.threading.Thread;
    var Metronome = function (millis) {
        Runner.call(this);
        if (millis < Metronome.MIN_INTERVAL) {
            millis = Metronome.MIN_INTERVAL;
        }
        this.__interval = millis;
        this.__last_time = 0;
        this.__thread = new Thread(this);
        this.__tickers = [];
    };
    Class(Metronome, Runner, null, null);
    Metronome.MIN_INTERVAL = 100;
    Metronome.prototype.start = function () {
        this.__thread.start();
    };
    Metronome.prototype.stop = function () {
        this.__thread.stop();
    };
    Metronome.prototype.setup = function () {
        this.__last_time = new Date().getTime();
        return false;
    };
    Metronome.prototype.process = function () {
        var tickers = this.getTickers();
        if (tickers.length === 0) {
            return false;
        }
        var now = new Date().getTime();
        var elapsed = now - this.__last_time;
        if (elapsed < this.__interval) {
            return false;
        }
        for (var i = tickers.length - 1; i >= 0; --i) {
            try {
                tickers[i].tick(now, elapsed);
            } catch (e) {}
        }
        this.__last_time = now;
        return true;
    };
    Metronome.prototype.getTickers = function () {
        return new Array(this.__tickers);
    };
    Metronome.prototype.addTicker = function (ticker) {
        if (this.__tickers.indexOf(ticker) < 0) {
            this.__tickers.push(ticker);
            return true;
        } else {
            return false;
        }
    };
    Metronome.prototype.removeTicker = function (ticker) {
        var index = this.__tickers.indexOf(ticker);
        if (index < 0) {
            return false;
        } else {
            this.__tickers.splice(index, 1);
            return true;
        }
    };
    var PrimeMetronome = {
        addTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.addTicker(ticker);
        },
        removeTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.removeTicker(ticker);
        },
        getInstance: function () {
            var metronome = this.__sharedMetronome;
            if (metronome === null) {
                metronome = new Metronome(200);
                metronome.start();
                this.__sharedMetronome = metronome;
            }
            return metronome;
        },
        __sharedMetronome: null
    };
    ns.threading.Metronome = Metronome;
    ns.threading.PrimeMetronome = PrimeMetronome;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Enum = sys.type.Enum;
    var Context = Interface(null, null);
    var Status = Enum(null, { Stopped: 0, Running: 1, Paused: 2 });
    ns.Context = Context;
    ns.Status = Status;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Transition = Interface(null, null);
    Transition.prototype.evaluate = function (machine, now) {
        throw new Error("NotImplemented");
    };
    var BaseTransition = function (targetStateName) {
        Object.call(this);
        this.__target = targetStateName;
    };
    Class(BaseTransition, Object, [Transition], null);
    BaseTransition.prototype.getTarget = function () {
        return this.__target;
    };
    ns.Transition = Transition;
    ns.BaseTransition = BaseTransition;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var BaseObject = sys.type.BaseObject;
    var State = Interface(null, null);
    State.prototype.onEnter = function (previous, machine, now) {
        throw new Error("NotImplemented");
    };
    State.prototype.onExit = function (next, machine, now) {
        throw new Error("NotImplemented");
    };
    State.prototype.onPause = function (machine) {
        throw new Error("NotImplemented");
    };
    State.prototype.onResume = function (machine) {
        throw new Error("NotImplemented");
    };
    State.prototype.evaluate = function (machine, now) {
        throw new Error("NotImplemented");
    };
    var BaseState = function () {
        BaseObject.call(this);
        this.__transitions = [];
    };
    Class(BaseState, BaseObject, [State], null);
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) >= 0) {
            throw new Error("transition exists: " + transition);
        }
        this.__transitions.push(transition);
    };
    BaseState.prototype.evaluate = function (machine, now) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(machine, now)) {
                return transition;
            }
        }
    };
    ns.State = State;
    ns.BaseState = BaseState;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Delegate = Interface(null, null);
    Delegate.prototype.enterState = function (next, machine) {
        throw new Error("NotImplemented");
    };
    Delegate.prototype.exitState = function (previous, machine) {
        throw new Error("NotImplemented");
    };
    Delegate.prototype.pauseState = function (current, machine) {
        throw new Error("NotImplemented");
    };
    Delegate.prototype.resumeState = function (current, machine) {
        throw new Error("NotImplemented");
    };
    ns.Delegate = Delegate;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Ticker = ns.threading.Ticker;
    var Machine = Interface(null, [Ticker]);
    Machine.prototype.getCurrentState = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.start = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.stop = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.pause = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.resume = function () {
        throw new Error("NotImplemented");
    };
    ns.Machine = Machine;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Status = ns.Status;
    var Machine = ns.Machine;
    var BaseMachine = function (defaultStateName) {
        Object.call(this);
        this.__default = defaultStateName ? defaultStateName : "default";
        this.__current = null;
        this.__status = Status.Stopped;
        this.__delegate = null;
        this.__states = {};
    };
    Class(BaseMachine, Object, [Machine], null);
    BaseMachine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    BaseMachine.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseMachine.prototype.getContext = function () {
        throw new Error("NotImplemented");
    };
    BaseMachine.prototype.setState = function (name, state) {
        this.__states[name] = state;
    };
    BaseMachine.prototype.getState = function (name) {
        return this.__states[name];
    };
    BaseMachine.prototype.getDefaultState = function () {
        return this.__states[this.__default];
    };
    BaseMachine.prototype.getTargetState = function (transition) {
        var name = transition.getTarget();
        return this.__states[name];
    };
    BaseMachine.prototype.getCurrentState = function () {
        return this.__current;
    };
    BaseMachine.prototype.setCurrentState = function (state) {
        return (this.__current = state);
    };
    var states_changed = function (oldState, newState) {
        if (!oldState) {
            if (!newState) {
                return false;
            }
        } else {
            if (oldState.equals(newState)) {
                return false;
            }
        }
        return true;
    };
    BaseMachine.prototype.changeState = function (newState, now) {
        var oldState = this.getCurrentState();
        if (!states_changed(oldState, newState)) {
            return false;
        }
        var machine = this.getContext();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.enterState(newState, machine);
        }
        if (oldState) {
            oldState.onExit(newState, machine, now);
        }
        this.setCurrentState(newState);
        if (newState) {
            newState.onEnter(oldState, machine, now);
        }
        if (delegate) {
            delegate.exitState(oldState, machine);
        }
        return true;
    };
    BaseMachine.prototype.start = function () {
        var now = new Date().getTime();
        this.changeState(this.getDefaultState(), now);
        this.__status = Status.Running;
    };
    BaseMachine.prototype.stop = function () {
        this.__status = Status.Stopped;
        var now = new Date().getTime();
        this.changeState(null, now);
    };
    BaseMachine.prototype.pause = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        if (current) {
            current.onPause(machine);
        }
        this.__status = Status.Paused;
        if (delegate) {
            delegate.pauseState(current, machine);
        }
    };
    BaseMachine.prototype.resume = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(current, machine);
        }
        this.__status = Status.Running;
        current.onResume(machine);
    };
    BaseMachine.prototype.tick = function (now, elapsed) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.Running.equals(this.__status)) {
            var transition = current.evaluate(machine, now);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next, now);
            }
        }
    };
    ns.BaseMachine = BaseMachine;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var PrimeMetronome = ns.threading.PrimeMetronome;
    var BaseMachine = ns.BaseMachine;
    var AutoMachine = function (defaultStateName) {
        BaseMachine.call(this, defaultStateName);
    };
    Class(AutoMachine, BaseMachine, null, {
        start: function () {
            BaseMachine.prototype.start.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this);
        },
        stop: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.stop.call(this);
        }
    });
    ns.AutoMachine = AutoMachine;
})(FiniteStateMachine, MONKEY);
