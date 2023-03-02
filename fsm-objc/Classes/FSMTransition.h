//
//  FSMTransition.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import <FiniteStateMachine/FSMProtocol.h>

@interface FSMTransition : NSObject <FSMTransition>

@property(nonatomic, readonly) NSString *targetStateName;

- (instancetype)initWithTargetStateName:(NSString *)name
NS_DESIGNATED_INITIALIZER;

@end
