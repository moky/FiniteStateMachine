//
//  FSMState.m
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import "fsm_state.h"

#import "FSMTransition.h"
#import "FSMState.h"

@interface FSMTransition (Hacking)

@property(nonatomic, readwrite) fsm_transition *innerTransition;

@end

static void on_enter(const fsm_state   *s,
                     const fsm_state   *p,
                     const fsm_context *ctx,
                     const fsm_time     now)
{
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> previous = p->ctx;
    id<FSMState> state = s->ctx;

    [state onEnter:previous machine:machine time:now];
}

static void on_exit(const fsm_state   *s,
                    const fsm_state   *n,
                    const fsm_context *ctx,
                    const fsm_time     now)
{
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> next = n->ctx;
    id<FSMState> state = s->ctx;

    [state onExit:next machine:machine time:now];
}

static void on_pause(const fsm_state   *s,
                     const fsm_context *ctx,
                     const fsm_time     now)
{
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> state = s->ctx;

    [state onPaused:machine time:now];
}

static void on_resume(const fsm_state   *s,
                      const fsm_context *ctx,
                      const fsm_time     now)
{
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> state = s->ctx;

    [state onResume:machine time:now];
}

@interface FSMState ()

@property(nonatomic, readwrite) fsm_state *innerState;

@property(nonatomic, retain) NSString *name;
@property(nonatomic, retain) NSMutableArray *transitions;

@end

@implementation FSMState

- (void)dealloc
{
	[_name release];
	[_transitions release];
	
    fsm_state *state = _innerState;
	if (state) {
		fsm_destroy_state(state);
	}
	
	[super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone
{
	id object = [super allocWithZone:zone];
	fsm_state *state = fsm_create_state(NULL);
	if (state) {
        state->on_enter = on_enter;
        state->on_exit = on_exit;
        state->on_pause = on_pause;
        state->on_resume = on_resume;
		state->ctx = object;
	}
	[object setInnerState:state];
	return object;
}

- (instancetype)init
{
	return [self initWithName:nil capacity:4];
}

- (instancetype)initWithName:(NSString *)name
{
    return [self initWithName:name capacity:4];
}

/* designated initializer */
- (instancetype)initWithName:(NSString *)name capacity:(NSUInteger)capacity
{
	self = [super init];
	if (self) {
		[self setName:name];
		self.transitions = [NSMutableArray arrayWithCapacity:capacity];
	}
	return self;
}

- (void)setName:(NSString *)name
{
	if (_name != name) {
		[name retain];
		[_name release];
		_name = name;
		
		fsm_rename_state(_innerState, [name UTF8String]);
	}
}

- (void)addTransition:(id<FSMTransition>)transition
{
	if (!transition) {
		return;
	}
    FSMTransition *trans = transition;
	
	fsm_add_transition(_innerState, [trans innerTransition]);
	[_transitions addObject:transition];
}

- (id<FSMTransition>)evaluate:(id<FSMContext>)ctx
                         time:(NSTimeInterval)now
{
    NSAssert(false, @"DON'T call me!");
    return nil;
}

- (void)onEnter:(id<FSMState>)previous
        machine:(id<FSMContext>)ctx
           time:(NSTimeInterval)now {
    NSLog(@"[FSM] enter state '%@', machine: %@", _name, ctx);
}

- (void)onExit:(id<FSMState>)next
       machine:(id<FSMContext>)ctx
          time:(NSTimeInterval)now
{
    NSLog(@"[FSM] exit state '%@', machine: %@", _name, ctx);
}

- (void)onPaused:(id<FSMContext>)ctx
            time:(NSTimeInterval)now
{
    NSLog(@"[FSM] pause state '%@', machine: %@", _name, ctx);
}

- (void)onResume:(id<FSMContext>)ctx
            time:(NSTimeInterval)now
{
    NSLog(@"[FSM] resume state '%@', machine: %@", _name, ctx);
}

@end
