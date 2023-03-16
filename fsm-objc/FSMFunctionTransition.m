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
//  FSMFunctionTransition.m
//  FiniteStateMachine
//
//  Created by Moky on 14-12-14.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import "FSMFunctionTransition.h"

@interface FSMFunctionTransition ()

@property(nonatomic, assign) id delegate;
@property(nonatomic)        SEL selector;

@end

@implementation FSMFunctionTransition

//- (void)dealloc {
//    _delegate = nil;
//    _selector = NULL;
//
//    [super dealloc];
//}

- (instancetype)initWithTarget:(NSUInteger)stateIndex {
    return [self initWithTarget:(NSUInteger)stateIndex
                       delegate:nil
                       selector:NULL];
}

/* designated initializer */
- (instancetype)initWithTarget:(NSUInteger)stateIndex
                      delegate:(id)delegate
                      selector:(SEL)selector {
    self = [super initWithTarget:stateIndex];
    if (self) {
	    self.delegate = delegate;
	    self.selector = selector;
    }
    return self;
}

// Override
- (BOOL)evaluate:(id<FSMContext>)machine time:(NSTimeInterval)now {
    NSAssert(_delegate && _selector, @"delegate or selector error");
    NSAssert([_delegate respondsToSelector:_selector],
             @"error: %@ does not respond to selector: %@",
             _delegate, NSStringFromSelector(_selector));
    IMP imp = [_delegate methodForSelector:_selector];
    BOOL (*sender)(id, SEL, id, double) = (BOOL (*)(id, SEL, id, double))imp;
    NSAssert(sender, @"method error: %@", NSStringFromSelector(_selector));
    return sender(_delegate, _selector, machine, now);
}

@end
