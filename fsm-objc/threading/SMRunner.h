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
//  SMRunner.h
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/5.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import <FiniteStateMachine/SMThread.h>

NS_ASSUME_NONNULL_BEGIN

@protocol SMHandler <NSObject>

/**
 *  Prepare for handling
 */
- (void)setup;

/**
 *  Handling run loop
 */
- (void)handle;

/**
 *  Cleanup after handled
 */
- (void)finish;

@end

@protocol SMProcessor <NSObject>

/**
 *  Do the job
 *
 * @return false on nothing to do
 */
- (BOOL)process;

@end

@protocol SMRunner <SMRunnable, SMHandler, SMProcessor>

@property(nonatomic, readonly, getter=isRunning) BOOL running;

- (void)stop;

@end

@interface SMRunner : NSObject <SMRunner>

// protected
- (void)idle;

@end

@interface SMRunner (Sleeping)

+ (void)idle:(NSTimeInterval)seconds;

@end

NS_ASSUME_NONNULL_END
