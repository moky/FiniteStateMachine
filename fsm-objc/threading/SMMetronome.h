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
//  SMMetronome.h
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/6.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import <FiniteStateMachine/SMRunner.h>

NS_ASSUME_NONNULL_BEGIN

@protocol SMTicker <NSObject>

/*
 *  Drive current thread forward
 *
 * @param now   - current time (seconds, from Jan 1, 1970 UTC)
 * @param delta - elapsed time (seconds, from previous tick)
 */
- (void)tick:(NSTimeInterval)now elapsed:(NSTimeInterval)delta;

@end

@protocol SMMetronome <SMRunner>

- (void)addTicker:(id<SMTicker>)ticker;
- (void)removeTicker:(id<SMTicker>)ticker;

- (void)start;

@end

@interface SMMetronome : SMRunner <SMMetronome>

- (instancetype)initWithInterval:(NSTimeInterval)seconds
NS_DESIGNATED_INITIALIZER;

@end

#pragma mark - Singleton

@interface SMPrimeMetronome : NSObject

+ (instancetype)sharedInstance;

- (void)addTicker:(id<SMTicker>)ticker;
- (void)removeTicker:(id<SMTicker>)ticker;

@end

NS_ASSUME_NONNULL_END
