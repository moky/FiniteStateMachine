/**
 * FSM - Finite State Machine (v2.0.0)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Aug. 24, 2025
 * @copyright (c) 2020-2025 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof FiniteStateMachine !== 'object') {
    FiniteStateMachine = {}
}
(function (fsm, mk) {
    if (typeof fsm.type !== 'object') {
        fsm.type = {}
    }
    if (typeof fsm.skywalker !== 'object') {
        fsm.skywalker = {}
    }
    if (typeof fsm.threading !== 'object') {
        fsm.threading = {}
    }
    var Interface = mk.type.Interface;
    var Class = mk.type.Class;
    var Converter = mk.type.Converter;
    var BaseObject = mk.type.BaseObject;
    var HashSet = mk.type.HashSet;
    var Enum = mk.type.Enum;
    var MILLISECONDS_PER_SECOND = 1000;
    var SECONDS_PER_MINUTE = 60;
    var MINUTES_PER_HOUR = 60;
    var HOURS_PER_DAY = 24;
    var MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
    var MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
    var MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;
    fsm.type.Duration = function (duration) {
        var days = Converter.getInt(duration['days'], 0);
        var hours = Converter.getInt(duration['hours'], 0);
        var minutes = Converter.getInt(duration['minutes'], 0);
        var seconds = Converter.getInt(duration['seconds'], 0);
        var milliseconds = Converter.getInt(duration['milliseconds'], 0);
        this.__millis = milliseconds + MILLISECONDS_PER_SECOND * seconds + MILLISECONDS_PER_MINUTE * minutes + MILLISECONDS_PER_HOUR * hours + MILLISECONDS_PER_DAY * days
    };
    var Duration = fsm.type.Duration;
    Duration.prototype.inMilliseconds = function () {
        return this.__millis
    };
    Duration.prototype.equals = function (other) {
        return this.__millis === get_millis(other)
    };
    Duration.prototype.shorterThan = function (other) {
        return this.__millis < get_millis(other)
    };
    Duration.prototype.longerThan = function (other) {
        return this.__millis > get_millis(other)
    };
    Duration.prototype.shorterOrEqual = function (other) {
        return this.__millis <= get_millis(other)
    };
    Duration.prototype.longerOrEqual = function (other) {
        return this.__millis >= get_millis(other)
    };
    Duration.prototype.abs = function () {
        return create_duration(Math.abs(this.__millis))
    };
    Duration.prototype.negated = function () {
        return create_duration(0 - this.__millis)
    };
    Duration.prototype.isNegative = function () {
        return this.__millis < 0
    };
    Duration.prototype.isPositive = function () {
        return this.__millis > 0
    };
    Duration.prototype.isZero = function () {
        return this.__millis === 0
    };
    Duration.prototype.adds = function (other) {
        return create_duration(this.__millis + get_millis(other))
    };
    Duration.prototype.subtracts = function (other) {
        return create_duration(this.__millis - get_millis(other))
    };
    Duration.prototype.multiplies = function (factor) {
        return create_duration(Math.round(this.__millis * factor))
    };
    Duration.prototype.divides = function (quotient) {
        return create_duration(Math.floor(this.__millis / quotient))
    };
    var get_millis = function (duration) {
        if (Interface.conforms(duration, Duration)) {
            return duration.inMilliseconds()
        } else {
            return Converter.getInt(duration, 0)
        }
    };
    var create_duration = function (millis) {
        return new Duration({'milliseconds': millis})
    };
    Duration.ofMilliseconds = function (millis) {
        return create_duration(millis * 1)
    };
    Duration.ofSeconds = function (seconds) {
        return create_duration(MILLISECONDS_PER_SECOND * seconds)
    };
    Duration.ofMinutes = function (minutes) {
        return create_duration(MILLISECONDS_PER_MINUTE * minutes)
    };
    Duration.ofHours = function (hours) {
        return create_duration(MILLISECONDS_PER_HOUR * hours)
    };
    Duration.ofDays = function (days) {
        return create_duration(MILLISECONDS_PER_DAY * days)
    };
    Duration.between = function (startTime, endTime) {
        return create_duration(endTime.getTime() - startTime.getTime())
    };
    Duration.prototype.addTo = function (time) {
        return new Date(time.getTime() + this.__millis)
    };
    Duration.prototype.subtractFrom = function (time) {
        return new Date(time.getTime() - this.__millis)
    };
    fsm.skywalker.Handler = Interface(null, null);
    var Handler = fsm.skywalker.Handler;
    Handler.prototype.setup = function () {
    };
    Handler.prototype.handle = function () {
    };
    Handler.prototype.finish = function () {
    };
    fsm.skywalker.Processor = Interface(null, null);
    var Processor = fsm.skywalker.Processor;
    Processor.prototype.process = function () {
    };
    fsm.skywalker.Runnable = Interface(null, null);
    var Runnable = fsm.skywalker.Runnable;
    Runnable.prototype.run = function () {
    };
    var STAGE_INIT = 0;
    var STAGE_HANDLING = 1;
    var STAGE_CLEANING = 2;
    var STAGE_STOPPED = 3;
    fsm.skywalker.Runner = function () {
        BaseObject.call(this);
        this.__running = false;
        this.__stage = STAGE_INIT
    };
    var Runner = fsm.skywalker.Runner;
    Class(Runner, BaseObject, [Runnable, Handler, Processor], {
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
    fsm.threading.Ticker = Interface(null, null);
    var Ticker = fsm.threading.Ticker;
    Ticker.prototype.tick = function (now, elapsed) {
    };
    fsm.threading.Thread = function () {
        BaseObject.call(this);
        if (arguments.length === 0) {
            this.__target = null
        } else {
            this.__target = arguments[0]
        }
        this.__running = false
    };
    var Thread = fsm.threading.Thread;
    Class(Thread, BaseObject, [Runnable], null);
    Thread.INTERVAL = Duration.ofMilliseconds(256);
    Thread.prototype.start = function () {
        this.__running = true;
        thr_run(this)
    };
    var thr_run = function (thread) {
        var running = thread.isRunning() && thread.run();
        if (running) {
            var interval = Thread.INTERVAL.inMilliseconds();
            setTimeout(function () {
                thr_run(thread)
            }, interval)
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
    fsm.threading.Metronome = function (interval) {
        Runner.call(this);
        if (!interval || interval.shorterThan(Metronome.MIN_INTERVAL)) {
            interval = Metronome.MIN_INTERVAL
        }
        this.__interval = interval;
        this.__last_time = null;
        this.__thread = new Thread(this);
        this.__tickers = new HashSet()
    };
    var Metronome = fsm.threading.Metronome;
    Class(Metronome, Runner, null, null);
    Metronome.MIN_INTERVAL = Duration.ofMilliseconds(100);
    Metronome.prototype.start = function () {
        this.__thread.start()
    };
    Metronome.prototype.stop = function () {
        this.__thread.stop()
    };
    Metronome.prototype.setup = function () {
        this.__last_time = new Date();
        return Runner.prototype.setup.call(this)
    };
    Metronome.prototype.process = function () {
        var tickers = this.getTickers();
        if (tickers.length === 0) {
            return false
        }
        var now = new Date();
        var elapsed = Duration.between(this.__last_time, now);
        if (elapsed.shorterThan(this.__interval)) {
            return false
        }
        for (var i = tickers.length - 1; i >= 0; --i) {
            try {
                tickers[i].tick(now, elapsed)
            } catch (e) {
            }
        }
        this.__last_time = now;
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
    fsm.threading.PrimeMetronome = {
        addTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.addTicker(ticker)
        }, removeTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.removeTicker(ticker)
        }, getInstance: function () {
            var metronome = sharedMetronome;
            if (metronome === null) {
                var interval = Duration.ofMilliseconds(200);
                metronome = new Metronome(interval);
                metronome.start();
                sharedMetronome = metronome
            }
            return metronome
        }
    };
    var PrimeMetronome = fsm.threading.PrimeMetronome;
    var sharedMetronome = null;
    fsm.Context = Interface(null, null);
    var Context = fsm.Context;
    fsm.Transition = Interface(null, null);
    var Transition = fsm.Transition;
    Transition.prototype.evaluate = function (ctx, now) {
    };
    fsm.State = Interface(null, null);
    var State = fsm.State;
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
    fsm.Delegate = Interface(null, null);
    var Delegate = fsm.Delegate;
    Delegate.prototype.enterState = function (next, ctx, now) {
    };
    Delegate.prototype.exitState = function (previous, ctx, now) {
    };
    Delegate.prototype.pauseState = function (current, ctx, now) {
    };
    Delegate.prototype.resumeState = function (current, ctx, now) {
    };
    fsm.Machine = Interface(null, [Ticker]);
    var Machine = fsm.Machine;
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
    fsm.BaseTransition = function (target) {
        BaseObject.call(this);
        this.__target = target
    };
    var BaseTransition = fsm.BaseTransition;
    Class(BaseTransition, BaseObject, [Transition], null);
    BaseTransition.prototype.getTarget = function () {
        return this.__target
    };
    fsm.BaseState = function (index) {
        BaseObject.call(this);
        this.__index = index;
        this.__transitions = []
    };
    var BaseState = fsm.BaseState;
    Class(BaseState, BaseObject, [State], {
        equals: function (other) {
            if (other instanceof BaseState) {
                if (other === this) {
                    return true
                }
                other = other.getIndex()
            } else if (Enum.isEnum(other)) {
                other = other.getValue()
            }
            return this.__index === other
        }, toString: function () {
            var clazz = this.getClassName();
            var index = this.getIndex();
            return '<' + clazz + ' index=' + index + ' />'
        }, valueOf: function () {
            return this.__index
        }
    });
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
    fsm.BaseMachine = function () {
        BaseObject.call(this);
        this.__states = [];
        this.__current = -1;
        this.__status = Status.STOPPED;
        this.__delegate = null
    };
    var BaseMachine = fsm.BaseMachine;
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
        if (this.__status !== State.STOPPED) {
            return false
        }
        var now = new Date();
        var ok = this.changeState(this.getDefaultState(), now);
        this.__status = Status.RUNNING;
        return ok
    };
    BaseMachine.prototype.stop = function () {
        if (this.__status === Status.STOPPED) {
            return false
        }
        this.__status = Status.STOPPED;
        var now = new Date();
        this.changeState(null, now)
    };
    BaseMachine.prototype.pause = function () {
        if (this.__status !== Status.RUNNING) {
            return false
        }
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
        return true
    };
    BaseMachine.prototype.resume = function () {
        if (this.__status !== Status.PAUSED) {
            return false
        }
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
        return true
    };
    BaseMachine.prototype.tick = function (now, elapsed) {
        if (this.__status !== Status.RUNNING) {
            return
        }
        var current = this.getCurrentState();
        if (current) {
            var machine = this.getContext();
            var transition = current.evaluate(machine, now);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next, now)
            }
        }
    };
    "use strict";
    fsm.AutoMachine = function () {
        BaseMachine.call(this)
    };
    var AutoMachine = fsm.AutoMachine;
    Class(AutoMachine, BaseMachine, null, {
        start: function () {
            var ok = BaseMachine.prototype.start.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this);
            return ok
        }, stop: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            return BaseMachine.prototype.stop.call(this)
        }, pause: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            return BaseMachine.prototype.pause.call(this)
        }, resume: function () {
            var ok = BaseMachine.prototype.resume.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this);
            return ok
        }
    })
})(FiniteStateMachine, MONKEY);
