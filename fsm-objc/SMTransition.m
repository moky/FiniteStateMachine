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
//  SMTransition.m
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import "sm_transition.h"

#import "SMTransition.h"

static sm_bool trans_eval(const sm_transition *trans,
                          const sm_context    *ctx,
                          const sm_time        now) {
    sm_machine *m = (sm_machine *)ctx;
    id<SMContext> machine = m->ctx;
    id<SMTransition> transition = trans->ctx;
    
    BOOL ok = [transition evaluate:machine time:now];
    return ok ? SMTrue : SMFalse;
}

@interface SMTransition () {
    
    NSUInteger _target;
}

@property(nonatomic, assign) sm_transition *innerTransition;

@end

@implementation SMTransition

- (void)dealloc {
    sm_transition *trans = _innerTransition;
    if (trans) {
        sm_destroy_transition(trans);
        _innerTransition = NULL;
    }
    
    [super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone {
    id object = [super allocWithZone:zone];
    sm_transition *trans = sm_create_transition(trans_eval);
    if (trans) {
	    trans->ctx = object;
    }
    [object setInnerTransition:trans];
    return object;
}

- (instancetype)init {
    NSAssert(false, @"don't call me!");
    return [self initWithTarget:-1];
}

/* designated initializer */
- (instancetype)initWithTarget:(NSUInteger)stateIndex {
    self = [super init];
    if (self) {
        self.target = stateIndex;
    }
    return self;
}

- (NSUInteger)target {
    return _target;
}

- (void)setTarget:(NSUInteger)target {
    _innerTransition->target = (unsigned int)target;
    _target = target;
}

// abstractmethod
- (BOOL)evaluate:(id<SMContext>)machine time:(NSTimeInterval)now {
    NSAssert(false, @"override me!");
    return YES;
}

@end
