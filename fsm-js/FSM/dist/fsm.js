/**
 * FSM - Finite State Machine (v0.2.0)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Jul. 5, 2022
 * @copyright (c) 2022 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = new MONKEY.Namespace();
}
if (typeof FiniteStateMachine.assert !== "function") {
    FiniteStateMachine.assert = console.assert;
}
(function (ns) {
    ns.fsm = FiniteStateMachine;
    if (typeof ns.skywalker !== "object") {
        ns.skywalker = new ns.Namespace();
    }
    if (typeof ns.threading !== "object") {
        ns.threading = new ns.Namespace();
    }
    ns.registers("skywalker");
    ns.registers("threading");
})(MONKEY);
(function (ns) {
    var Runnable = function () {};
    ns.Interface(Runnable, null);
    Runnable.prototype.run = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.threading.Runnable = Runnable;
    ns.threading.registers("Runnable");
})(MONKEY);
(function (ns) {
    var Runnable = ns.threading.Runnable;
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            this.__target = null;
            this.__interval = 128;
        } else {
            if (arguments.length === 2) {
                this.__target = arguments[0];
                this.__interval = arguments[1];
            } else {
                if (typeof arguments[0] === "number") {
                    this.__target = null;
                    this.__interval = arguments[0];
                } else {
                    this.__target = arguments[0];
                    this.__interval = 128;
                }
            }
        }
        this.__running = false;
        this.__thread_id = 0;
    };
    ns.Class(Thread, Object, [Runnable], null);
    Thread.prototype.start = function () {
        this.__running = true;
        var thread = this;
        this.__thread_id = setInterval(function () {
            var ran = thread.isRunning() && thread.run();
            if (!ran) {
                stop(thread);
            }
        }, this.getInterval());
    };
    var stop = function (thread) {
        var tid = thread.__thread_id;
        if (tid > 0) {
            thread.__thread_id = 0;
            clearInterval(tid);
        }
    };
    Thread.prototype.stop = function () {
        this.__running = false;
        stop(this);
    };
    Thread.prototype.isRunning = function () {
        return this.__running;
    };
    Thread.prototype.getInterval = function () {
        return this.__interval;
    };
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError("Thread::run() > override me!");
        } else {
            return target.run();
        }
    };
    ns.threading.Thread = Thread;
    ns.threading.registers("Thread");
})(MONKEY);
(function (ns) {
    var Ticker = function () {};
    ns.Interface(Ticker, null);
    Ticker.prototype.tick = function (now, delta) {
        ns.assert(false, "implement me!");
    };
    ns.threading.Ticker = Ticker;
    ns.threading.registers("Ticker");
})(MONKEY);
(function (ns) {
    var Runnable = ns.threading.Runnable;
    var Thread = ns.threading.Thread;
    var Metronome = function () {
        Object.call(this);
        this.__tickers = [];
        this.__last_time = 0;
        this.__thread = null;
    };
    ns.Class(Metronome, Object, [Runnable], null);
    Metronome.MIN_DELTA = 100;
    Metronome.prototype.start = function () {
        this.__last_time = new Date().getTime();
        var thread = new Thread(this);
        this.__thread = thread;
        thread.start();
    };
    Metronome.prototype.stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop();
        }
    };
    Metronome.prototype.run = function () {
        var now = new Date().getTime();
        var delta = now - this.__last_time;
        if (delta > Metronome.MIN_DELTA) {
            try {
                var tickers = new Array(this.__tickers);
                drive(tickers, now, delta);
            } catch (e) {
                ns.error("Metronome::run()", e);
            }
            this.__last_time = now;
        }
        return true;
    };
    var drive = function (tickers, now, delta) {
        for (var index = 0; index < tickers.length; ++index) {
            try {
                tickers[index].tick(now, delta);
            } catch (e) {
                ns.error("Ticker::tick()", e);
            }
        }
    };
    Metronome.prototype.addTicker = function (ticker) {
        if (this.__tickers.indexOf(ticker) < 0) {
            this.__tickers.push(ticker);
        } else {
            throw new Error("ticker exists: " + ticker);
        }
    };
    Metronome.prototype.removeTicker = function (ticker) {
        var index = this.__tickers.indexOf(ticker);
        if (index >= 0) {
            this.__tickers.splice(index, 1);
        }
    };
    Metronome.getInstance = function () {
        if (!sharedMetronome) {
            sharedMetronome = new Metronome();
            sharedMetronome.start();
        }
        return sharedMetronome;
    };
    var sharedMetronome = null;
    ns.threading.Metronome = Metronome;
    ns.threading.registers("Metronome");
})(MONKEY);
(function (ns) {
    var Handler = function () {};
    ns.Interface(Handler, null);
    Handler.prototype.setup = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Handler.prototype.handle = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Handler.prototype.finish = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.skywalker.Handler = Handler;
    ns.skywalker.registers("Handler");
})(MONKEY);
(function (ns) {
    var Processor = function () {};
    ns.Interface(Processor, null);
    Processor.prototype.process = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.skywalker.Processor = Processor;
    ns.skywalker.registers("Processor");
})(MONKEY);
(function (ns) {
    var Thread = ns.threading.Thread;
    var Handler = ns.skywalker.Handler;
    var Processor = ns.skywalker.Processor;
    var STAGE_INIT = 0;
    var STAGE_HANDLING = 1;
    var STAGE_CLEANING = 2;
    var STAGE_STOPPED = 3;
    var Runner = function () {
        if (arguments.length === 0) {
            Thread.call(this);
            this.__processor = null;
        } else {
            if (arguments.length === 2) {
                Thread.call(this, arguments[1]);
                this.__processor = arguments[0];
            } else {
                if (typeof arguments[0] === "number") {
                    Thread.call(this, arguments[0]);
                    this.__processor = null;
                } else {
                    Thread.call(this);
                    this.__processor = arguments[0];
                }
            }
        }
        this.__stage = STAGE_INIT;
    };
    ns.Class(Runner, Thread, [Handler, Processor], {
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
                } catch (e) {
                    ns.error("Runner::handle() error", this, e);
                }
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
        },
        process: function () {
            var processor = this.__processor;
            if (!processor || processor === this) {
                throw new SyntaxError("Runner::process() > override me!");
            } else {
                return processor.process();
            }
        }
    });
    ns.skywalker.Runner = Runner;
    ns.skywalker.registers("Runner");
})(MONKEY);
(function (ns, sys) {
    var Context = function () {};
    sys.Interface(Context, null);
    var Status = sys.type.Enum(null, { Stopped: 0, Running: 1, Paused: 2 });
    ns.Context = Context;
    ns.Status = Status;
    ns.registers("Context");
    ns.registers("Status");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Transition = function () {};
    sys.Interface(Transition, null);
    Transition.prototype.evaluate = function (machine) {
        ns.assert(false, "implement me!");
        return false;
    };
    var BaseTransition = function (targetStateName) {
        Object.call(this);
        this.__target = targetStateName;
    };
    sys.Class(BaseTransition, Object, [Transition], null);
    BaseTransition.prototype.getTarget = function () {
        return this.__target;
    };
    ns.Transition = Transition;
    ns.BaseTransition = BaseTransition;
    ns.registers("Transition");
    ns.registers("BaseTransition");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var State = function () {};
    sys.Interface(State, null);
    State.prototype.onEnter = function (previous, machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.onExit = function (next, machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.onPause = function (machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.onResume = function (machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.evaluate = function (machine) {
        ns.assert(false, "implement me!");
        return null;
    };
    var BaseState = function () {
        Object.call(this);
        this.__transitions = [];
    };
    sys.Class(BaseState, Object, [State], null);
    BaseState.prototype.equals = function (other) {
        return this === other;
    };
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) >= 0) {
            throw new Error("transition exists: " + transition);
        }
        this.__transitions.push(transition);
    };
    BaseState.prototype.evaluate = function (machine) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(machine)) {
                return transition;
            }
        }
    };
    ns.State = State;
    ns.BaseState = BaseState;
    ns.registers("State");
    ns.registers("BaseState");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Ticker = sys.threading.Ticker;
    var Machine = function () {};
    sys.Interface(Machine, [Ticker]);
    Machine.prototype.getDefaultState = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Machine.prototype.getTargetState = function (transition) {
        ns.assert(false, "implement me!");
        return null;
    };
    Machine.prototype.getCurrentState = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Machine.prototype.setCurrentState = function (state) {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.changeState = function (state) {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.start = function () {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.stop = function () {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.pause = function () {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.resume = function () {
        ns.assert(false, "implement me!");
    };
    ns.Machine = Machine;
    ns.registers("Machine");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Delegate = function () {};
    sys.Interface(Delegate, null);
    Delegate.prototype.enterState = function (next, machine) {
        ns.assert(false, "implement me!");
    };
    Delegate.prototype.exitState = function (previous, machine) {
        ns.assert(false, "implement me!");
    };
    Delegate.prototype.pauseState = function (current, machine) {
        ns.assert(false, "implement me!");
    };
    Delegate.prototype.resumeState = function (current, machine) {
        ns.assert(false, "implement me!");
    };
    ns.Delegate = Delegate;
    ns.registers("Delegate");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Status = ns.Status;
    var Machine = ns.Machine;
    var BaseMachine = function (defaultStateName) {
        Object.call(this);
        this.__default = defaultStateName ? defaultStateName : "default";
        this.__current = null;
        this.__status = Status.Stopped;
        this.__delegate = null;
        this.__stateMap = {};
    };
    sys.Class(BaseMachine, Object, [Machine], null);
    BaseMachine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    BaseMachine.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseMachine.prototype.getContext = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    BaseMachine.prototype.setState = function (name, state) {
        this.__stateMap[name] = state;
    };
    BaseMachine.prototype.getState = function (name) {
        return this.__stateMap[name];
    };
    BaseMachine.prototype.getDefaultState = function () {
        return this.__stateMap[this.__default];
    };
    BaseMachine.prototype.getTargetState = function (transition) {
        var name = transition.getTarget();
        return this.__stateMap[name];
    };
    BaseMachine.prototype.getCurrentState = function () {
        return this.__current;
    };
    BaseMachine.prototype.setCurrentState = function (state) {
        return (this.__current = state);
    };
    BaseMachine.prototype.changeState = function (newState) {
        var oldState = this.getCurrentState();
        if (!oldState) {
            if (!newState) {
                return false;
            }
        } else {
            if (oldState.equals(newState)) {
                return false;
            }
        }
        var machine = this.getContext();
        var delegate = this.getDelegate();
        if (oldState) {
            oldState.onExit(newState, machine);
        }
        if (delegate) {
            delegate.enterState(newState, machine);
        }
        this.setCurrentState(newState);
        if (delegate) {
            delegate.exitState(oldState, machine);
        }
        if (newState) {
            newState.onEnter(oldState, machine);
        }
        return true;
    };
    BaseMachine.prototype.start = function () {
        this.changeState(this.getDefaultState());
        this.__status = Status.Running;
    };
    BaseMachine.prototype.stop = function () {
        this.__status = Status.Stopped;
        this.changeState(null);
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
    BaseMachine.prototype.tick = function (now, delta) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.Running.equals(this.__status)) {
            var transition = current.evaluate(machine);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next);
            }
        }
    };
    ns.BaseMachine = BaseMachine;
    ns.registers("BaseMachine");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Metronome = sys.threading.Metronome;
    var BaseMachine = ns.BaseMachine;
    var AutoMachine = function (defaultStateName) {
        BaseMachine.call(this, defaultStateName);
    };
    sys.Class(AutoMachine, BaseMachine, null, {
        start: function () {
            BaseMachine.prototype.start.call(this);
            var timer = Metronome.getInstance();
            timer.addTicker(this);
        },
        stop: function () {
            var timer = Metronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.stop.call(this);
        }
    });
    ns.AutoMachine = AutoMachine;
    ns.registers("AutoMachine");
})(FiniteStateMachine, MONKEY);
