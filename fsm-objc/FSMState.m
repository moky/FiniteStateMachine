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

@property(nonatomic, assign) fsm_transition *innerTransition;

@end

static void on_enter(const fsm_state   *s,
                     const fsm_state   *p,
                     const fsm_context *ctx,
                     const fsm_time     now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> previous = p == NULL ? nil : p->ctx;
    id<FSMState> state    = s == NULL ? nil : s->ctx;

    [state onEnter:previous machine:machine time:now];
}

static void on_exit(const fsm_state   *s,
                    const fsm_state   *n,
                    const fsm_context *ctx,
                    const fsm_time     now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> next  = n == NULL ? nil : n->ctx;
    id<FSMState> state = s == NULL ? nil : s->ctx;

    [state onExit:next machine:machine time:now];
}

static void on_pause(const fsm_state   *s,
                     const fsm_context *ctx,
                     const fsm_time     now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> state = s == NULL ? nil : s->ctx;

    [state onPaused:machine time:now];
}

static void on_resume(const fsm_state   *s,
                      const fsm_context *ctx,
                      const fsm_time     now) {
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMState> state = s == NULL ? nil : s->ctx;

    [state onResume:machine time:now];
}

@interface FSMState () {
    
    NSUInteger _index;
}

@property(nonatomic, assign) fsm_state *innerState;

@property(nonatomic, retain) NSMutableArray<id<FSMTransition>> *transitions;

@end

@implementation FSMState

- (void)dealloc {
	[_transitions release];
    _transitions = nil;
	
    fsm_state *state = _innerState;
	if (state) {
		fsm_destroy_state(state);
        _innerState = NULL;
	}
	
	[super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone {
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

- (instancetype)init {
    NSAssert(false, @"don't call me!");
	return [self initWithIndex:-1 capacity:4];
}

- (instancetype)initWithIndex:(NSUInteger)stateIndex {
    return [self initWithIndex:stateIndex capacity:4];
}

/* designated initializer */
- (instancetype)initWithIndex:(NSUInteger)stateIndex
                    capacity:(NSUInteger)countOfTransitions {
	self = [super init];
	if (self) {
        self.index = stateIndex;
		self.transitions = [NSMutableArray arrayWithCapacity:countOfTransitions];
	}
	return self;
}

- (NSUInteger)index {
    return _index;
}
- (void)setIndex:(NSUInteger)index {
    _innerState->index = (unsigned int)index;
    _index = index;
}

- (void)addTransition:(FSMTransition *)transition {
    NSAssert(![_transitions containsObject:transition], @"transition exists");
	fsm_add_transition(_innerState, [transition innerTransition]);
	[_transitions addObject:transition];
}

// abstractmethod
- (void)onEnter:(id<FSMState>)previous
        machine:(id<FSMContext>)ctx
           time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// abstractmethod
- (void)onExit:(id<FSMState>)next
       machine:(id<FSMContext>)ctx
          time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// abstractmethod
- (void)onPaused:(id<FSMContext>)ctx
            time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// abstractmethod
- (void)onResume:(id<FSMContext>)ctx
            time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// Override
- (id<FSMTransition>)evaluate:(id<FSMContext>)ctx
                         time:(NSTimeInterval)now {
    // NOTICE: actualy we DON'T need to implement this function,
    //         because it's running via 'fsm_tick_state()' in C program.
    __block id<FSMTransition> trans = nil;
    [_transitions enumerateObjectsUsingBlock:^(id<FSMTransition> item,
                                               NSUInteger idx, BOOL *stop) {
        if ([item evaluate:ctx time:now]) {
            trans = item;
            *stop = YES;
        }
    }];
    return trans;
}

@end
