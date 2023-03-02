//
//  FSMTransition.m
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#import "fsm_transition.h"

#import "FSMTransition.h"

static fsm_bool trans_eval(const fsm_transition *trans,
                           const fsm_context    *ctx,
                           const fsm_time        now)
{
    fsm_machine *m = (fsm_machine *)ctx;
    id<FSMContext> machine = m->ctx;
    id<FSMTransition> transition = trans->ctx;
    
    BOOL ok = [transition evaluate:machine time:now];
    return ok ? FSMTrue : FSMFalse;
}

@interface FSMTransition ()

@property(nonatomic, readwrite) fsm_transition *innerTransition;

@property(nonatomic, retain) NSString *targetStateName;

@end

@implementation FSMTransition

- (void)dealloc
{
	[_targetStateName release];
	
    fsm_transition *trans = _innerTransition;
	if (trans) {
        fsm_destroy_transition(trans);
	}
	
	[super dealloc];
}

+ (instancetype)allocWithZone:(struct _NSZone *)zone
{
	id object = [super allocWithZone:zone];
	fsm_transition *trans = fsm_create_transition(NULL, trans_eval);
	if (trans) {
		trans->ctx = object;
	}
    [object setInnerTransition:trans];
	return object;
}

- (instancetype)init
{
	return [self initWithTargetStateName:nil];
}

/* designated initializer */
- (instancetype)initWithTargetStateName:(NSString *)name
{
	self = [super init];
	if (self) {
		[self setTargetStateName:name];
	}
	return self;
}

- (void)setTargetStateName:(NSString *)targetStateName
{
	if (_targetStateName != targetStateName) {
		[targetStateName retain];
		[_targetStateName release];
		_targetStateName = targetStateName;
		
		fsm_rename_transition(_innerTransition, [targetStateName UTF8String]);
	}
}

- (BOOL)evaluate:(id<FSMContext>)machine time:(NSTimeInterval)now
{
    NSAssert(false, @"override me!");
    return YES;
}

@end
