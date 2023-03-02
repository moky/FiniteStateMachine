//
//  FSMProtocol.h
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/2.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol FSMTicker <NSObject>

/*
 *  Drive current thread forward
 *
 * @param now   - current time (seconds, from Jan 1, 1970 UTC)
 * @param delta - elapsed time (seconds, from previous tick)
 */
- (void)tick:(NSTimeInterval)now elapsed:(NSTimeInterval)delta;

@end

//typedef NS_ENUM(UInt8, FSMStatus) {
//    
//    FSMStatusStopped = 0,
//    FSMStatusRunning = 1,
//    FSMStatusPaused  = 2
//};

/**
 *  State Machine Context
 */
@protocol FSMContext <NSObject>

@end

@protocol FSMState;
@protocol FSMMachine;

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
- (void)machine:(id<FSMContext>)ctx
     enterState:(nullable id<FSMState>)next
           time:(NSTimeInterval)now;
/**
 *  Called after old state exited
 *  (get current state from context)
 *
 * @param previous - old state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)machine:(id<FSMContext>)ctx
      exitState:(nullable id<FSMState>)previous
           time:(NSTimeInterval)now;

//@optional
/**
 *  Called after current state paused
 *
 * @param current  - current state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)machine:(id<FSMContext>)ctx
     pauseState:(id<FSMState>)current
           time:(NSTimeInterval)now;
/**
 *  Called before current state resumed
 *
 * @param current  - current state
 * @param ctx      - context (machine)
 * @param now      - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)machine:(id<FSMContext>)ctx
    resumeState:(id<FSMState>)current
           time:(NSTimeInterval)now;

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
- (BOOL)evaluate:(id<FSMContext>)machine
            time:(NSTimeInterval)now;

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
- (void)onEnter:(nullable id<FSMState>)previous
        machine:(id<FSMContext>)ctx
           time:(NSTimeInterval)now;

/**
 *  Called before old state exited
 *
 * @param next    - new state
 * @param ctx     - context (machine)
 * @param now     - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)onExit:(nullable id<FSMState>)next
       machine:(id<FSMContext>)ctx
          time:(NSTimeInterval)now;

//@optional
/**
 *  Called before current state paused
 *
 * @param ctx - context (machine)
 * @param now - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)onPaused:(id<FSMContext>)ctx
            time:(NSTimeInterval)now;

/**
 *  Called after current state resumed
 *
 * @param ctx - context (machine)
 * @param now - current time (seconds, from Jan 1, 1970 UTC)
 */
- (void)onResume:(id<FSMContext>)ctx
            time:(NSTimeInterval)now;

@required
/**
 *  Called by machine.tick() to evaluate each transitions
 *
 * @param ctx     - context (machine)
 * @param now     - current time (seconds, from Jan 1, 1970 UTC)
 * @return success transition, or null to stay the current state
 */
- (nullable id<FSMTransition>)evaluate:(id<FSMContext>)ctx
                                  time:(NSTimeInterval)now;

@end

/**
 *  State machine
 */
@protocol FSMMachine <NSObject>

@property(nonatomic, readonly, nullable) id<FSMState> currentState;

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

NS_ASSUME_NONNULL_END
