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
//  SMThread.m
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/5.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import "SMThread.h"

typedef NS_ENUM(UInt8, SMThreadStatus) {
    
    SMThreadStatusStopped = 0,
    SMThreadStatusStarted = 1,
    SMThreadStatusRunning = 2,
};

@interface SMThread () {
    
    SMThreadStatus _status;
}

@property(nonatomic, assign, nullable) id<SMRunnable> target;

@end

@implementation SMThread

- (void)dealloc {
    _target = nil;

    [super dealloc];
}

/* designated initializer */
- (instancetype)init {
    if (self = [super init]) {
        _status = SMThreadStatusStopped;
        _target = nil;
    }
    return self;
}

/* designated initializer */
- (instancetype)initWithTarget:(id<SMRunnable>)target {
    if (self = [super init]) {
        _status = SMThreadStatusStopped;
        _target = target;
    }
    return self;
}

// Override
- (void)run {
    id<SMRunnable> target = [_target retain];
    if (target) {
        [target run];
        [target release];
    }
}

// private
- (void)setStatus:(SMThreadStatus)flag {
    _status = flag;
}

// Override
- (BOOL)isAlive {
    return _status > SMThreadStatusStopped;
}

// Override
- (void)start {
    if ([self isAlive]) {
        NSAssert(false, @"the thread is running");
        return;
    } else {
        _status = SMThreadStatusStarted;
    }
    /*__weak*/ __block __typeof(self) thread = self;

    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^{
        [thread setStatus:SMThreadStatusRunning];
        @try {
            [thread run];
        } @finally {
            [thread setStatus:SMThreadStatusStopped];
        }
    });
}

// Override
- (void)cancel {
    // TODO: cancel the waiting block
//    if (_status == SMThreadStatusStarted) {
//        dispatch_block_cancel(self.block);
//    }
//    self.block = NULL;
}

@end

@implementation SMThread (Creation)

+ (instancetype)threadWithTarget:(id<SMRunnable>)target {
    SMThread *thread = [[SMThread alloc] initWithTarget:target];
    return [thread autorelease];
}

@end

@implementation SMThread (Sleeping)

+ (void)sleep:(NSTimeInterval)seconds {
    [NSThread sleepForTimeInterval:seconds];
}

@end
