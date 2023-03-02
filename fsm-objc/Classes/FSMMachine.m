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

#import "FSMState.h"
#import "FSMMachine.h"

@interface FSMState (Hacking)

@property(nonatomic, readwrite) fsm_state *innerState;

@end

static void enter_state(const struct _fsm_delegate *d,
                        const struct _fsm_state    *s,
                        const         fsm_context  *ctx,
                        const         fsm_time      now)
{
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> next = s->ctx;
    
    [delegate machine:context enterState:next time:now];
}

static void exit_state(const struct _fsm_delegate *d,
                       const struct _fsm_state    *s,
                       const         fsm_context  *ctx,
                       const         fsm_time      now)
{
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> previous = s->ctx;

    [delegate machine:context exitState:previous time:now];
}

static void pause_state(const struct _fsm_delegate *d,
                        const struct _fsm_state    *s,
                        const         fsm_context  *ctx,
                        const         fsm_time      now)
{
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> current = s->ctx;

    [delegate machine:context pauseState:current time:now];
}

static void resume_state(const struct _fsm_delegate *d,
                         const struct _fsm_state    *s,
                         const         fsm_context  *ctx,
                         const         fsm_time      now)
{
    FSMMachine *machine = d->ctx;
    id<FSMDelegate> delegate = machine.delegate;
    id<FSMContext> context = (id<FSMContext>)machine;
    id<FSMState> current = s->ctx;

    [delegate machine:context resumeState:current time:now];
}

@interface FSMMachine ()

@property(nonatomic, readwrite) fsm_machine  *innerMachine;
@property(nonatomic, readwrite) fsm_delegate *innerDelegate;

@property(nonatomic, retain) NSMutableArray * states;

@end

@implementation FSMMachine

- (void)dealloc
{
	[_defaultStateName release];
	[_states release];
	
    fsm_machine *machine = _innerMachine;
	if (machine != NULL) {
		fsm_destroy_machine(machine);
	}
    fsm_delegate *delegate = _innerDelegate;
    if (delegate != NULL) {
        fsm_destroy_delegate(delegate);
    }
	
	[super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone
{
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

- (instancetype)init
{
	return [self initWithDefaultStateName:@"default" capacity:8];
}

/* designated initializer */
- (instancetype)initWithDefaultStateName:(NSString *)name capacity:(NSUInteger)capacity
{
	self = [super init];
	if (self) {
		self.defaultStateName = name;
		self.states = [NSMutableArray arrayWithCapacity:capacity];
		
		self.delegate = nil;
	}
	return self;
}

- (void)addState:(FSMState *)state
{
	if (!state) {
		return;
	}
	
	fsm_add_state(_innerMachine, [state innerState]);
	[_states addObject:state];
}

- (id<FSMState>)currentState
{
	const fsm_state *s = fsm_get_current_state(_innerMachine);
	NSAssert(s, @"failed to get current state: %d", _innerMachine->current);
	id<FSMState> state = s->ctx;
	NSAssert([state isKindOfClass:[FSMState class]], @"memory error");
	return state;
}

#pragma mark -

- (void)start
{
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    @synchronized (self) {
        machine->start(machine, now);
    }
}

- (void)stop
{
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    @synchronized (self) {
        machine->stop(machine, now);
    }
}

- (void)pause
{
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    @synchronized (self) {
        machine->pause(machine, now);
    }
}

- (void)resume
{
    fsm_machine *machine = _innerMachine;
    if (machine == NULL) {
        return;
    }
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    @synchronized (self) {
        machine->resume(machine, now);
    }
}

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
