// license: https://mit-license.org
//
//  FSM : Finite State Machine
//
//                               Written in 2015 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2015 Albert Moky
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
//  SMAutoMachine.m
//  FiniteStateMachine
//
//  Created by Moky on 15-1-9.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#import "SMMetronome.h"

#import "SMAutoMachine.h"

@implementation SMAutoMachine

// Override
- (void)start {
    [super start];
    SMPrimeMetronome *timer = [SMPrimeMetronome sharedInstance];
    [timer addTicker:self];
}

// Override
- (void)stop {
    SMPrimeMetronome *timer = [SMPrimeMetronome sharedInstance];
    [timer removeTicker:self];
    [super stop];
}

// Override
- (void)pause {
    SMPrimeMetronome *timer = [SMPrimeMetronome sharedInstance];
    [timer removeTicker:self];
    [super pause];
}

// Override
- (void)resume {
    [super resume];
    SMPrimeMetronome *timer = [SMPrimeMetronome sharedInstance];
    [timer addTicker:self];
}

@end
