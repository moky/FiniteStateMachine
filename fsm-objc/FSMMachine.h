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
//  FSMMachine.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import <FiniteStateMachine/FSMMetronome.h>
#import <FiniteStateMachine/FSMProtocol.h>

NS_ASSUME_NONNULL_BEGIN

@class FSMState;

@interface FSMMachine : NSObject <FSMMachine>

@property(nonatomic, assign, nullable) id<FSMDelegate> delegate;

@property(nonatomic, readonly) id<FSMContext> context;  // the machine itself

- (instancetype)initWithCapacity:(NSUInteger)countOfStates
NS_DESIGNATED_INITIALIZER;

- (void)addState:(FSMState *)state; // add state with transition(s)

@end

NS_ASSUME_NONNULL_END
