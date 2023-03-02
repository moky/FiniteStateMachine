//
//  FSMMachine.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import <FiniteStateMachine/FSMProtocol.h>

NS_ASSUME_NONNULL_BEGIN

@interface FSMMachine : NSObject <FSMMachine, FSMTicker>

@property(nonatomic, weak, nullable) id<FSMDelegate> delegate;

@property(nonatomic, retain) NSString *defaultStateName; // default is "default"

- (instancetype)initWithDefaultStateName:(NSString *)name
                                capacity:(NSUInteger)capacity
NS_DESIGNATED_INITIALIZER;

@end

@class FSMState;

@interface FSMMachine (State)

@property(nonatomic, readonly) id<FSMState> defaultState;

- (void)addState:(FSMState *)state; // add state with transition(s)

- (nullable id<FSMState>)targetState:(id<FSMTransition>)transition;

@end

NS_ASSUME_NONNULL_END
