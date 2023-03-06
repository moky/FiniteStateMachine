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

#import "fsm_delegate.h"
#import "fsm_machine.h"
#import "fsm_state.h"

#import "NSDate+Timestamp.h"
#import "FSMState.h"

#import "FSMMachine.h"

@interface FSMState (Hacking)

@property(nonatomic, assign) fsm_state *innerState;

@end

static void enter_state(const struct _fsm_delegate *d,
                        const struct _fsm_state    *s,
                        const         fsm_context  *ctx,
                        const         fsm_time      now) {
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> next = s->ctx;
    
    [delegate machine:context enterState:next time:now];
}

static void exit_state(const struct _fsm_delegate *d,
                       const struct _fsm_state    *s,
                       const         fsm_context  *ctx,
                       const         fsm_time      now) {
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> previous = s->ctx;

    [delegate machine:context exitState:previous time:now];
}

static void pause_state(const struct _fsm_delegate *d,
                        const struct _fsm_state    *s,
                        const         fsm_context  *ctx,
                        const         fsm_time      now) {
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> current = s->ctx;

    [delegate machine:context pauseState:current time:now];
}

static void resume_state(const struct _fsm_delegate *d,
                         const struct _fsm_state    *s,
                         const         fsm_context  *ctx,
                         const         fsm_time      now) {
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> current = s->ctx;

    [delegate machine:context resumeState:current time:now];
}

@interface FSMMachine ()

@property(nonatomic, assign) fsm_machine  *innerMachine;
@property(nonatomic, assign) fsm_delegate *innerDelegate;

@property(nonatomic, retain) NSString *defaultStateName; // default is "default"
@property(nonatomic, retain) NSMutableArray<id<FSMState>> *states;

@end

@implementation FSMMachine

- (void)dealloc {
	[_defaultStateName release];
    _defaultStateName = nil;
	[_states release];
    _states = nil;
	
    fsm_machine *machine = _innerMachine;
	if (machine != NULL) {
		fsm_destroy_machine(machine);
        _innerMachine = NULL;
	}
    fsm_delegate *delegate = _innerDelegate;
    if (delegate != NULL) {
        fsm_destroy_delegate(delegate);
        _innerDelegate = NULL;
    }
	
	[super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone {
	id object = [super allocWithZone:zone];
	fsm_machine *machine = fsm_create_machine(NULL);
	if (machine) {
        fsm_delegate *delegate = fsm_create_delegate();
        if (delegate != NULL) {
            delegate->enter_state  = enter_state;
            delegate->exit_state   = exit_state;
            delegate->pause_state  = pause_state;
            delegate->resume_state = resume_state;
            delegate->ctx = object;
        }
        machine->delegate = delegate;
		machine->ctx = object;
	}
	[object setInnerMachine:machine];
	return object;
}

- (instancetype)init {
	return [self initWithDefaultStateName:@"default" capacity:8];
}

/* designated initializer */
- (instancetype)initWithDefaultStateName:(NSString *)stateName
                                capacity:(NSUInteger)countOfStates {
	if (self = [super init]) {
		self.defaultStateName = stateName;
		self.states = [NSMutableArray arrayWithCapacity:countOfStates];
		
		self.delegate = nil;
	}
	return self;
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
    NSTimeInterval now = [NSDate currentTimeInterval];
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
    NSTimeInterval now = [NSDate currentTimeInterval];
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
    NSTimeInterval now = [NSDate currentTimeInterval];
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
    NSTimeInterval now = [NSDate currentTimeInterval];
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
