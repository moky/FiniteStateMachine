// license: https://mit-license.org
//
//  FSM : Finite State Machine
//
//                               Written in 2023 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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
//  FSMProtocol.h
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/2.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import <FiniteStateMachine/FSMMetronome.h>

NS_ASSUME_NONNULL_BEGIN

/**
 *  State Machine Context
 */
@protocol FSMContext <NSObject>

@end

/**
 *  State Transition
 */
@protocol FSMTransition <NSObject>

/**
 *  Evaluate the current state
 *
 * @param machine - context
 * @param now     - current time (seconds, from Jan 1, 1970 UTC)
 * @return true when current state should be changed
 */
- (BOOL)evaluate:(__kindof id<FSMContext>)machine time:(NSTimeInterval)now;

@end

/**
 *  Finite State
 */
@protocol FSMState <NSObject>

/**
 *  Called after new state entered
 *
 * @param previous - old state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)onEnter:(nullable __kindof id<FSMState>)previous
        machine:(__kindof id<FSMContext>)ctx
           time:(NSTimeInterval)now;

/**
 *  Called before old state exited
 *
 * @param next    - new state
 * @param ctx     - context (machine)
 * @param now     - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)onExit:(nullable __kindof id<FSMState>)next
       machine:(__kindof id<FSMContext>)ctx
          time:(NSTimeInterval)now;

//@optional
/**
 *  Called before current state paused
 *
 * @param ctx - context (machine)
 * @param now - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)onPaused:(__kindof id<FSMContext>)ctx
            time:(NSTimeInterval)now;

/**
 *  Called after current state resumed
 *
 * @param ctx - context (machine)
 * @param now - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)onResume:(__kindof id<FSMContext>)ctx
            time:(NSTimeInterval)now;

@required
/**
 *  Called by machine.tick() to evaluate each transitions
 *
 * @param ctx     - context (machine)
 * @param now     - current time (seconds, from Jan 1, 1970 UTC)
 * @return success transition, or null to stay the current state
 */
- (nullable id<FSMTransition>)evaluate:(__kindof id<FSMContext>)ctx
                                  time:(NSTimeInterval)now;

@end

/**
 *  State machine
 */
@protocol FSMMachine <FSMTicker>

@property(nonatomic, readonly, nullable) __kindof id<FSMState> currentState;

/**
 *  Change current state to 'default'
 */
- (void)start;

/**
 *  Change current state to null and stop the machine
 */
- (void)stop;

/**
 *  Pause machine, current state not change
 */
- (void)pause;

/**
 *  Resume machine with current state
 */
- (void)resume;

@end

/**
 *  State Machine Delegate
 */
@protocol FSMDelegate <NSObject>

/**
 *  Called before new state entered
 *  (get current state from context)
 *
 * @param next     - new state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)machine:(__kindof id<FSMContext>)ctx
     enterState:(nullable __kindof id<FSMState>)next
           time:(NSTimeInterval)now;
/**
 *  Called after old state exited
 *  (get current state from context)
 *
 * @param previous - old state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)machine:(__kindof id<FSMContext>)ctx
      exitState:(nullable __kindof id<FSMState>)previous
           time:(NSTimeInterval)now;

//@optional
/**
 *  Called after current state paused
 *
 * @param current  - current state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)machine:(__kindof id<FSMContext>)ctx
     pauseState:(__kindof id<FSMState>)current
           time:(NSTimeInterval)now;
/**
 *  Called before current state resumed
 *
 * @param current  - current state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)machine:(__kindof id<FSMContext>)ctx
    resumeState:(__kindof id<FSMState>)current
           time:(NSTimeInterval)now;

@end

NS_ASSUME_NONNULL_END
