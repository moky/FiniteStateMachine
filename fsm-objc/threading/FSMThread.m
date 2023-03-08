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
//  FSMThread.m
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/5.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import "FSMThread.h"

typedef NS_ENUM(UInt8, FSMThreadStatus) {
    
    FSMThreadStatusStopped = 0,
    FSMThreadStatusStarted = 1,
    FSMThreadStatusRunning = 2,
};

@interface FSMThread () {
    
    FSMThreadStatus _status;
}

@property(nonatomic, assign, nullable) id<FSMRunnable> target;
@property(nonatomic, copy) dispatch_block_t block;

@end

@implementation FSMThread

- (void)dealloc {
    _target = nil;
    [_block release];
    _block = NULL;

    [super dealloc];
}

/* designated initializer */
- (instancetype)init {
    if (self = [super init]) {
        _status = FSMThreadStatusStopped;
        _target = nil;
        _block = NULL;
    }
    return self;
}

/* designated initializer */
- (instancetype)initWithTarget:(id<FSMRunnable>)target {
    if (self = [super init]) {
        _status = FSMThreadStatusStopped;
        _target = target;
        _block = NULL;
    }
    return self;
}

// Override
- (void)run {
    id<FSMRunnable> target = [_target retain];
    if (target) {
        [target run];
        [target release];
    }
}

// private
- (void)setStatus:(FSMThreadStatus)flag {
    _status = flag;
}

// Override
- (BOOL)isAlive {
    return _status > FSMThreadStatusStopped;
}

// Override
- (void)start {
    if ([self isAlive]) {
        NSAssert(false, @"the thread is running");
        return;
    } else {
        _status = FSMThreadStatusStarted;
    }
    __block FSMThread *thread = self;

    dispatch_block_t block = ^{
        [thread setStatus:FSMThreadStatusRunning];
        @try {
            [thread run];
        } @finally {
            [thread setStatus:FSMThreadStatusStopped];
        }
    };
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0),
                   block);
    self.block = block;
}

// Override
- (void)cancel {
    if (_status == FSMThreadStatusStarted) {
        dispatch_block_cancel(_block);
    }
}

@end

@implementation FSMThread (Creation)

+ (instancetype)threadWithTarget:(id<FSMRunnable>)target {
    FSMThread *thread = [[FSMThread alloc] initWithTarget:target];
    return [thread autorelease];
}

@end

@implementation FSMThread (Sleeping)

+ (void)sleep:(NSTimeInterval)seconds {
    [NSThread sleepForTimeInterval:seconds];
}

@end
