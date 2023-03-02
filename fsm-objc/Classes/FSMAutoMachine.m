//
//  FSMAutoMachine.m
//  FiniteStateMachine
//
//  Created by Moky on 15-1-9.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#import "FSMAutoMachine.h"

@interface FSMAutoMachine () {

    NSTimeInterval _lastTime;
}

@property(nonatomic, retain) NSTimer *timer;

@end

@implementation FSMAutoMachine

- (void)dealloc
{
	self.timer = nil;
	
	[super dealloc];
}

- (instancetype)initWithDefaultStateName:(NSString *)name capacity:(NSUInteger)capacity
{
	return [self initWithDefaultStateName:name
								 capacity:capacity
								 interval:0.125f];
}

/* designated initializer */
- (instancetype)initWithDefaultStateName:(NSString *)name
                                capacity:(NSUInteger)capacity
                                interval:(NSTimeInterval)interval
{
	self = [super initWithDefaultStateName:name capacity:capacity];
	if (self) {
		_interval = interval;
        _lastTime = 0.0f;
		self.timer = nil;
	}
	return self;
}

- (instancetype)initWithInterval:(NSTimeInterval)interval
{
	return [self initWithDefaultStateName:@"default"
								 capacity:8
								 interval:interval];
}

- (void)setTimer:(NSTimer *)timer
{
	if (_timer != timer) {
		[_timer invalidate];
		_timer = timer;
	}
}

- (void)tick
{
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    NSTimeInterval elapsed = now - _lastTime;
    
    [self tick:now elapsed:elapsed];
    
    _lastTime = now;
}

- (void)_startMachine
{
	// start
	self.timer = [NSTimer scheduledTimerWithTimeInterval:_interval
												  target:self
												selector:@selector(tick)
												userInfo:nil
												 repeats:YES];
}

- (void)_stopMachine
{
	// stop timer and release itself and the target
	self.timer = nil;
}

- (void)start
{
    _lastTime = [[NSDate date] timeIntervalSince1970];
	[super start];
	[self _startMachine];
}

- (void)stop
{
	[self _stopMachine];
	[super stop];
}

- (void)pause
{
	[self _stopMachine];
	[super pause];
}

- (void)resume
{
	[super resume];
	[self _startMachine];
}

@end
