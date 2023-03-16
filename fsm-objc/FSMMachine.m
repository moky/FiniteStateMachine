// license: https://mit-license.org
//
//  FSM : Finite State Machine
//
//                               Written in 2014 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2014 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//
//  FSMMachine.m
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import <ObjectKey/ObjectKey.h>

#import "fsm_delegate.h"
#import "fsm_machine.h"
#import "fsm_state.h"

#import "FSMState.h"

#import "FSMMachine.h"

@interface FSMState (Hacking)

@property(nonatomic, assign) fsm_state *innerState;

@end

static void enter_state(const struct _fsm_delegate *d,
                        const struct _fsm_state    *s,
                        const         fsm_context  *ctx,
                        const         fsm_time      now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> context = m->ctx;
    id<FSMDelegate> delegate = d == NULL ? nil : d->ctx;
    id<FSMState> next        = s == NULL ? nil : s->ctx;
    if (!delegate) {
        FSMMachine *machine = (FSMMachine *)context;
        delegate = [machine delegate];
    }
    [delegate machine:context enterState:next time:now];
}

static void exit_state(const struct _fsm_delegate *d,
                       const struct _fsm_state    *s,
                       const         fsm_context  *ctx,
                       const         fsm_time      now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> context = m->ctx;
    id<FSMDelegate> delegate = d == NULL ? nil : d->ctx;
    id<FSMState> previous    = s == NULL ? nil : s->ctx;
    if (!delegate) {
        FSMMachine *machine = (FSMMachine *)context;
        delegate = [machine delegate];
    }
    [delegate machine:context exitState:previous time:now];
}

static void pause_state(const struct _fsm_delegate *d,
                        const struct _fsm_state    *s,
                        const         fsm_context  *ctx,
                        const         fsm_time      now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> context = m->ctx;
    id<FSMDelegate> delegate = d == NULL ? nil : d->ctx;
    id<FSMState> current     = s == NULL ? nil : s->ctx;
    if (!delegate) {
        FSMMachine *machine = (FSMMachine *)context;
        delegate = [machine delegate];
    }
    [delegate machine:context pauseState:current time:now];
}

static void resume_state(const struct _fsm_delegate *d,
                         const struct _fsm_state    *s,
                         const         fsm_context  *ctx,
                         const         fsm_time      now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> context = m->ctx;
    id<FSMDelegate> delegate = d == NULL ? nil : d->ctx;
    id<FSMState> current     = s == NULL ? nil : s->ctx;
    if (!delegate) {
        FSMMachine *machine = (FSMMachine *)context;
        delegate = [machine delegate];
    }
    [delegate machine:context resumeState:current time:now];
}

@interface FSMMachine ()

@property(nonatomic, assign) fsm_machine  *innerMachine;
@property(nonatomic, assign) fsm_delegate *innerDelegate;

@property(nonatomic, retain) NSMutableArray<id<FSMState>> *states;

@end

@implementation FSMMachine

- (void)dealloc {
    [_states release];
    _states = nil;
    
    fsm_delegate *delegate = _innerDelegate;
    if (delegate != NULL) {
        fsm_destroy_delegate(delegate);
        _innerDelegate = NULL;
    }
    fsm_machine *machine = _innerMachine;
    if (machine != NULL) {
        fsm_destroy_machine(machine);
        _innerMachine = NULL;
    }

    [super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone {
    id object = [super allocWithZone:zone];
    fsm_machine *machine = fsm_create_machine(8);
    if (machine) {
        fsm_delegate *delegate = fsm_create_delegate();
        if (delegate != NULL) {
            delegate->enter_state  = enter_state;
            delegate->exit_state   = exit_state;
            delegate->pause_state  = pause_state;
            delegate->resume_state = resume_state;
            //delegate->ctx = object;
        }
        [object setInnerDelegate:delegate];
        machine->delegate = delegate;
	    machine->ctx = object;
    }
    [object setInnerMachine:machine];
    return object;
}

- (instancetype)init {
    return [self initWithCapacity:8];
}

/* designated initializer */
- (instancetype)initWithCapacity:(NSUInteger)countOfStates {
    if (self = [super init]) {
	    self.states = [NSMutableArray arrayWithCapacity:countOfStates];
	    
	    self.delegate = nil;
    }
    return self;
}

- (id<FSMDelegate>)delegate {
    return _innerDelegate->ctx;
}
- (void)setDelegate:(id<FSMDelegate>)delegate {
    _innerDelegate->ctx = delegate;
}

- (id<FSMContext>)context {
    NSAssert(false, @"override me!");
    return nil;
}

- (void)addState:(FSMState *)state {
    NSAssert(state, @"state empty");
    fsm_add_state(_innerMachine, [state innerState]);
    [_states addObject:state];
}

// Override
- (id<FSMState>)currentState {
    const fsm_state *s = fsm_get_current_state(_innerMachine);
    NSAssert(s, @"failed to get current state: %d", _innerMachine->current);
    id<FSMState> state = s->ctx;
    NSAssert([state isKindOfClass:[FSMState class]], @"memory error");
    return state;
}

// Override
- (void)start {
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = OKGetCurrentTimeInterval();
    @synchronized (self) {
        machine->start(machine, now);
    }
}

// Override
- (void)stop {
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = OKGetCurrentTimeInterval();
    @synchronized (self) {
        machine->stop(machine, now);
    }
}

// Override
- (void)pause {
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = OKGetCurrentTimeInterval();
    @synchronized (self) {
        machine->pause(machine, now);
    }
}

// Override
- (void)resume {
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = OKGetCurrentTimeInterval();
    @synchronized (self) {
        machine->resume(machine, now);
    }
}

// Override
- (void)tick:(NSTimeInterval)now elapsed:(NSTimeInterval)delta {
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    @synchronized(self) {
        machine->tick(machine, now, delta);
    }
}

@end
