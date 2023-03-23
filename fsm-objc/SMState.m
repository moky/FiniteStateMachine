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
//  SMState.m
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import "sm_state.h"

#import "SMTransition.h"
#import "SMState.h"

@interface SMTransition (Hacking)

@property(nonatomic, assign) sm_transition *innerTransition;

@end

static void on_enter(const sm_state   *s,
                     const sm_state   *p,
                     const sm_context *ctx,
                     const sm_time     now) {
    sm_machine *m = (sm_machine *)ctx;
    id<SMContext> machine = m->ctx;
    id<SMState> previous = p == NULL ? nil : p->ctx;
    id<SMState> state    = s == NULL ? nil : s->ctx;

    [state onEnter:previous machine:machine time:now];
}

static void on_exit(const sm_state   *s,
                    const sm_state   *n,
                    const sm_context *ctx,
                    const sm_time     now) {
    sm_machine *m = (sm_machine *)ctx;
    id<SMContext> machine = m->ctx;
    id<SMState> next  = n == NULL ? nil : n->ctx;
    id<SMState> state = s == NULL ? nil : s->ctx;

    [state onExit:next machine:machine time:now];
}

static void on_pause(const sm_state   *s,
                     const sm_context *ctx,
                     const sm_time     now) {
    sm_machine *m = (sm_machine *)ctx;
    id<SMContext> machine = m->ctx;
    id<SMState> state = s == NULL ? nil : s->ctx;

    [state onPaused:machine time:now];
}

static void on_resume(const sm_state   *s,
                      const sm_context *ctx,
                      const sm_time     now) {
    sm_machine *m = (sm_machine *)ctx;
    id<SMContext> machine = m->ctx;
    id<SMState> state = s == NULL ? nil : s->ctx;

    [state onResume:machine time:now];
}

@interface SMState () {
    
    NSUInteger _index;
}

@property(nonatomic, assign) sm_state *innerState;

@property(nonatomic, retain) NSMutableArray<id<SMTransition>> *transitions;

@end

@implementation SMState

- (void)dealloc {
    [_transitions release];
    _transitions = nil;
    
    sm_state *state = _innerState;
    if (state) {
	    sm_destroy_state(state);
        _innerState = NULL;
    }
    
    [super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone {
    id object = [super allocWithZone:zone];
    sm_state *state = sm_create_state(NULL, 2);
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

- (void)addTransition:(SMTransition *)transition {
    NSAssert(![_transitions containsObject:transition], @"transition exists");
    sm_add_transition(_innerState, [transition innerTransition]);
    [_transitions addObject:transition];
}

// abstractmethod
- (void)onEnter:(id<SMState>)previous machine:(id<SMContext>)ctx time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// abstractmethod
- (void)onExit:(id<SMState>)next machine:(id<SMContext>)ctx time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// abstractmethod
- (void)onPaused:(id<SMContext>)ctx time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// abstractmethod
- (void)onResume:(id<SMContext>)ctx time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
}

// Override
- (id<SMTransition>)evaluate:(id<SMContext>)ctx time:(NSTimeInterval)now {
    // NOTICE: actualy we DON'T need to implement this function,
    //         because it's running via 'sm_tick_state()' in C program.
    __block id<SMTransition> trans = nil;
    [_transitions enumerateObjectsUsingBlock:^(id<SMTransition> item,
                                               NSUInteger idx, BOOL *stop) {
        if ([item evaluate:ctx time:now]) {
            trans = item;
            *stop = YES;
        }
    }];
    return trans;
}

@end
