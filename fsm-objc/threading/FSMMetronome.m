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
//  FSMMetronome.m
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/6.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import <ObjectKey/ObjectKey.h>

#import "FSMMetronome.h"

// at least wait 1/60 of a second
#define MIN_INTERVAL 1.0/60

@interface FSMMetronome () {
    
    NSTimeInterval _interval;
    NSTimeInterval _lastTime;
}

@property(nonatomic, retain) id<FSMThread> daemon;
@property(nonatomic, retain) OKWeakSet<id<FSMTicker>> *allTickers;

@end

@implementation FSMMetronome

- (void)dealloc {
    [_daemon release];
    _daemon = nil;
    [_allTickers release];
    _allTickers = nil;
    
    [super dealloc];
}

- (instancetype)init {
    return [self initWithInterval:MIN_INTERVAL];
}

/* designated initializer */
- (instancetype)initWithInterval:(NSTimeInterval)seconds {
    if (self = [super init]) {
        _interval = seconds;
        _lastTime = 0;
        _daemon = [[FSMThread alloc] initWithTarget:self];
        _allTickers = [[OKWeakSet alloc] initWithCapacity:8];
    }
    return self;
}

// Override
- (void)setup {
    [super setup];
    _lastTime = OKGetCurrentTimeInterval();
}

// Override
- (BOOL)process {
    NSArray<id<FSMTicker>> *tickers = [self getTickers];
    if ([tickers count] == 0) {
        // nothing to do now,
        // return false to have a rest ^_^
        return NO;
    }
    // 1. check time
    NSTimeInterval now = OKGetCurrentTimeInterval();
    NSTimeInterval elapsed = now - _lastTime;
    NSTimeInterval waiting = _interval - elapsed;
    if (waiting < MIN_INTERVAL) {
        waiting = MIN_INTERVAL;
    }
    [FSMRunner idle:waiting];
    now += waiting;
    elapsed += waiting;
    // 2. drive tickers
    for (id<FSMTicker> item in tickers) {
        @try {
            [item tick:now elapsed:elapsed];
        } @catch (NSException *exception) {
            NSLog(@"tick error: %@", exception);
        } @finally {
        }
    }
    // 3. update last time
    _lastTime = now;
    return YES;
}

// private
- (NSArray<id<FSMTicker>> *)getTickers {
    @synchronized (self) {
        return [_allTickers allObjects];
    }
}

- (void)addTicker:(id<FSMTicker>)ticker {
    @synchronized (self) {
        [_allTickers addObject:ticker];
    }
}

- (void)removeTicker:(id<FSMTicker>)ticker {
    @synchronized (self) {
        [_allTickers removeObject:ticker];
    }
}

- (void)start {
    [_daemon start];
}

- (void)stop {
    [super stop];
    [_daemon cancel];
}

@end

#pragma mark - Singleton

@interface FSMPrimeMetronome ()

@property(nonatomic, retain) FSMMetronome *metronome;

@end

@implementation FSMPrimeMetronome

OKSingletonImplementations(FSMPrimeMetronome, sharedInstance)

- (void)dealloc {
    [_metronome release];
    _metronome = nil;
    
    [super dealloc];
}

- (instancetype)init {
    if (self = [super init]) {
        FSMMetronome *metronome = [[FSMMetronome alloc] initWithInterval:0.2];
        self.metronome = metronome;
        [metronome start];
        [metronome release];
    }
    return self;
}

- (void)addTicker:(id<FSMTicker>)ticker {
    [_metronome addTicker:ticker];
}

- (void)removeTicker:(id<FSMTicker>)ticker {
    [_metronome removeTicker:ticker];
}

@end
