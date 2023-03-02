//
//  FSMState.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import <FiniteStateMachine/FSMProtocol.h>

@interface FSMState : NSObject <FSMState>

@property(nonatomic, readonly) NSString *name;

- (instancetype)initWithName:(NSString *)name;

- (instancetype)initWithName:(NSString *)name
                    capacity:(NSUInteger)capacity
NS_DESIGNATED_INITIALIZER;

- (void)addTransition:(id<FSMTransition>)transition;

@end
