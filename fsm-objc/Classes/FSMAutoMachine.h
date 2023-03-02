//
//  FSMAutoMachine.h
//  FiniteStateMachine
//
//  Created by Moky on 15-1-9.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#import "FSMMachine.h"

NS_ASSUME_NONNULL_BEGIN

@interface FSMAutoMachine : FSMMachine

@property(nonatomic, readwrite) NSTimeInterval interval; // default is 0.125

- (instancetype)initWithDefaultStateName:(NSString *)name
                                capacity:(NSUInteger)capacity
                                interval:(NSTimeInterval)interval
NS_DESIGNATED_INITIALIZER;

- (instancetype)initWithInterval:(NSTimeInterval)interval;

@end

NS_ASSUME_NONNULL_END
