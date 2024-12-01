/**
 * FSM - Finite State Machine (v1.0.0)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 20, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof FiniteStateMachine !== 'object') {
    FiniteStateMachine = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.skywalker !== 'object') {
        ns.skywalker = {}
    }
    if (typeof ns.threading !== 'object') {
        ns.threading = {}
    }
})(FiniteStateMachine);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Runnable = Interface(null, null);
    Runnable.prototype.run = function () {
    };
    ns.skywalker.Runnable = Runnable
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Handler = Interface(null, null);
    Handler.prototype.setup = function () {
    };
    Handler.prototype.handle = function () {
    };
    Handler.prototype.finish = function () {
    };
    ns.skywalker.Handler = Handler
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Processor = Interface(null, null);
    Processor.prototype.process = function () {
    };
    ns.skywalker.Processor = Processor
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
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
        this.__stage = STAGE_INIT
    };
    Class(Runner, Object, [Runnable, Handler, Processor], {
        run: function () {
            if (this.__stage === STAGE_INIT) {
                if (this.setup()) {
                    return true
                }
                this.__stage = STAGE_HANDLING
            }
            if (this.__stage === STAGE_HANDLING) {
                try {
                    if (this.handle()) {
                        return true
                    }
                } catch (e) {
                }
                this.__stage = STAGE_CLEANING
            }
            if (this.__stage === STAGE_CLEANING) {
                if (this.finish()) {
                    return true
                }
                this.__stage = STAGE_STOPPED
            }
            return false
        }, setup: function () {
            this.__running = true;
            return false
        }, handle: function () {
            while (this.isRunning()) {
                if (this.process()) {
                } else {
                    return true
                }
            }
            return false
        }, finish: function () {
            return false
        }
    });
    Runner.prototype.isRunning = function () {
        return this.__running
    };
    Runner.prototype.stop = function () {
        this.__running = false
    };
    ns.skywalker.Runner = Runner
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Runnable = ns.skywalker.Runnable;
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            this.__target = null
        } else {
            this.__target = arguments[0]
        }
        this.__running = false
    };
    Class(Thread, Object, [Runnable], null);
    Thread.INTERVAL = 256;
    Thread.prototype.start = function () {
        this.__running = true;
        run(this)
    };
    var run = function (thread) {
        var running = thread.isRunning() && thread.run();
        if (running) {
            setTimeout(function () {
                run(thread)
            }, Thread.INTERVAL)
        }
    };
    Thread.prototype.isRunning = function () {
        return this.__running
    };
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError('Thread::run() > override me!');
        } else if (typeof target === 'function') {
            return target()
        } else if (Interface.conforms(target, Runnable)) {
            return target.run()
        } else {
            throw new SyntaxError('Thread::run() > target is not runnable: ' + target);
        }
    };
    Thread.prototype.stop = function () {
        this.__running = false
    };
    ns.threading.Thread = Thread
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var IObject = sys.type.Object;
    var Ticker = Interface(null, [IObject]);
    Ticker.prototype.tick = function (now, elapsed) {
    };
    ns.threading.Ticker = Ticker
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var HashSet = sys.type.HashSet;
    var Runner = ns.skywalker.Runner;
    var Thread = ns.threading.Thread;
    var Metronome = function (millis) {
        Runner.call(this);
        if (millis < Metronome.MIN_INTERVAL) {
            millis = Metronome.MIN_INTERVAL
        }
        this.__interval = millis;
        this.__last_time = 0;
        this.__thread = new Thread(this);
        this.__tickers = new HashSet()
    };
    Class(Metronome, Runner, null, null);
    Metronome.MIN_INTERVAL = 100;
    Metronome.prototype.start = function () {
        this.__thread.start()
    };
    Metronome.prototype.stop = function () {
        this.__thread.stop()
    };
    Metronome.prototype.setup = function () {
        this.__last_time = (new Date()).getTime();
        return Runner.prototype.setup.call(this)
    };
    Metronome.prototype.process = function () {
        var tickers = this.getTickers();
        if (tickers.length === 0) {
            return false
        }
        var now = new Date();
        var elapsed = now.getTime() - this.__last_time;
        if (elapsed < this.__interval) {
            return false
        }
        for (var i = tickers.length - 1; i >= 0; --i) {
            try {
                tickers[i].tick(now, elapsed)
            } catch (e) {
            }
        }
        this.__last_time = now.getTime();
        return true
    };
    Metronome.prototype.getTickers = function () {
        return this.__tickers.toArray()
    };
    Metronome.prototype.addTicker = function (ticker) {
        return this.__tickers.add(ticker)
    };
    Metronome.prototype.removeTicker = function (ticker) {
        return this.__tickers.remove(ticker)
    };
    var PrimeMetronome = {
        addTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.addTicker(ticker)
        }, removeTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.removeTicker(ticker)
        }, getInstance: function () {
            var metronome = this.__sharedMetronome;
            if (metronome === null) {
                metronome = new Metronome(200);
                metronome.start();
                this.__sharedMetronome = metronome
            }
            return metronome
        }, __sharedMetronome: null
    };
    ns.threading.Metronome = Metronome;
    ns.threading.PrimeMetronome = PrimeMetronome
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Ticker = ns.threading.Ticker;
    var Context = Interface(null, null);
    var Transition = Interface(null, null);
    Transition.prototype.evaluate = function (ctx, now) {
    };
    var State = Interface(null, null);
    State.prototype.evaluate = function (ctx, now) {
    };
    State.prototype.onEnter = function (previous, ctx, now) {
    };
    State.prototype.onExit = function (next, ctx, now) {
    };
    State.prototype.onPause = function (ctx, now) {
    };
    State.prototype.onResume = function (ctx, now) {
    };
    var Delegate = Interface(null, null);
    Delegate.prototype.enterState = function (next, ctx, now) {
    };
    Delegate.prototype.exitState = function (previous, ctx, now) {
    };
    Delegate.prototype.pauseState = function (current, ctx, now) {
    };
    Delegate.prototype.resumeState = function (current, ctx, now) {
    };
    var Machine = Interface(null, [Ticker]);
    Machine.prototype.getCurrentState = function () {
    };
    Machine.prototype.start = function () {
    };
    Machine.prototype.stop = function () {
    };
    Machine.prototype.pause = function () {
    };
    Machine.prototype.resume = function () {
    };
    ns.Context = Context;
    ns.Transition = Transition;
    ns.State = State;
    ns.Delegate = Delegate;
    ns.Machine = Machine
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var BaseObject = sys.type.BaseObject;
    var Transition = ns.Transition;
    var State = ns.State;
    var Machine = ns.Machine;
    var BaseTransition = function (target) {
        Object.call(this);
        this.__target = target
    };
    Class(BaseTransition, Object, [Transition], null);
    BaseTransition.prototype.getTarget = function () {
        return this.__target
    };
    var BaseState = function (index) {
        BaseObject.call(this);
        this.__index = index;
        this.__transitions = []
    };
    Class(BaseState, BaseObject, [State], null);
    BaseState.prototype.equals = function (other) {
        if (other instanceof BaseState) {
            if (other === this) {
                return true
            }
            other = other.getIndex()
        } else if (Enum.isEnum(other)) {
            other = other.getValue()
        }
        return this.__index === other
    };
    BaseState.prototype.toString = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var index = this.getIndex();
        return '<' + clazz + ' index=' + index + ' />'
    };
    BaseState.prototype.valueOf = function () {
        return this.__index
    };
    BaseState.prototype.getIndex = function () {
        return this.__index
    };
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) >= 0) {
            throw new ReferenceError('transition exists: ' + transition);
        }
        this.__transitions.push(transition)
    };
    BaseState.prototype.evaluate = function (ctx, now) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(ctx, now)) {
                return transition
            }
        }
    };
    var Status = Enum('MachineStatus', {STOPPED: 0, RUNNING: 1, PAUSED: 2});
    var BaseMachine = function () {
        BaseObject.call(this);
        this.__states = [];
        this.__current = -1;
        this.__status = Status.STOPPED;
        this.__delegate = null
    };
    Class(BaseMachine, BaseObject, [Machine], null);
    BaseMachine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate
    };
    BaseMachine.prototype.getDelegate = function () {
        return this.__delegate
    };
    BaseMachine.prototype.getContext = function () {
    };
    BaseMachine.prototype.addState = function (newState) {
        var index = newState.getIndex();
        if (index < this.__states.length) {
            var old = this.__states[index];
            this.__states[index] = newState;
            return old
        }
        var spaces = index - this.__states.length;
        for (var i = 0; i < spaces; ++i) {
            this.__states.push(null)
        }
        this.__states.push(newState);
        return null
    };
    BaseMachine.prototype.getState = function (index) {
        return this.__states[index]
    };
    BaseMachine.prototype.getDefaultState = function () {
        if (this.__states.length === 0) {
            throw new ReferenceError('states empty');
        }
        return this.__states[0]
    };
    BaseMachine.prototype.getTargetState = function (transition) {
        var index = transition.getTarget();
        return this.__states[index]
    };
    BaseMachine.prototype.getCurrentState = function () {
        var index = this.__current;
        return index < 0 ? null : this.__states[index]
    };
    BaseMachine.prototype.setCurrentState = function (state) {
        this.__current = !state ? -1 : state.getIndex()
    };
    BaseMachine.prototype.changeState = function (newState, now) {
        var oldState = this.getCurrentState();
        if (!oldState) {
            if (!newState) {
                return false
            }
        } else if (oldState === newState) {
            return false
        }
        var ctx = this.getContext();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.enterState(newState, ctx, now)
        }
        if (oldState) {
            oldState.onExit(newState, ctx, now)
        }
        this.setCurrentState(newState);
        if (newState) {
            newState.onEnter(oldState, ctx, now)
        }
        if (delegate) {
            delegate.exitState(oldState, ctx, now)
        }
        return true
    };
    BaseMachine.prototype.start = function () {
        var now = new Date();
        this.changeState(this.getDefaultState(), now);
        this.__status = Status.RUNNING
    };
    BaseMachine.prototype.stop = function () {
        this.__status = Status.STOPPED;
        var now = new Date();
        this.changeState(null, now)
    };
    BaseMachine.prototype.pause = function () {
        var now = new Date();
        var ctx = this.getContext();
        var current = this.getCurrentState();
        if (current) {
            current.onPause(ctx, now)
        }
        this.__status = Status.PAUSED;
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(current, ctx, now)
        }
    };
    BaseMachine.prototype.resume = function () {
        var now = new Date();
        var ctx = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(current, ctx, now)
        }
        this.__status = Status.RUNNING;
        if (current) {
            current.onResume(ctx, now)
        }
    };
    BaseMachine.prototype.tick = function (now, elapsed) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.RUNNING.equals(this.__status)) {
            var transition = current.evaluate(machine, now);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next, now)
            }
        }
    };
    ns.BaseTransition = BaseTransition;
    ns.BaseState = BaseState;
    ns.BaseMachine = BaseMachine
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var PrimeMetronome = ns.threading.PrimeMetronome;
    var BaseMachine = ns.BaseMachine;
    var AutoMachine = function () {
        BaseMachine.call(this)
    };
    Class(AutoMachine, BaseMachine, null, {
        start: function () {
            BaseMachine.prototype.start.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this)
        }, stop: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.stop.call(this)
        }, pause: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.pause.call(this)
        }, resume: function () {
            BaseMachine.prototype.resume.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this)
        }
    });
    ns.AutoMachine = AutoMachine
})(FiniteStateMachine, MONKEY);
