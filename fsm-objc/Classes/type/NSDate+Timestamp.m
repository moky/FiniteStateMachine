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
//  NSDate+Timestamp.m
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/6.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import "NSDate+Timestamp.h"

NSDate *NSDateFromTimeInterval(NSTimeInterval seconds) {
    return [NSDate dateWithTimeIntervalSince1970:seconds];
}

NSTimeInterval NSDateToTimeInterval(NSDate *time) {
    return [time timeIntervalSince1970];
}

@implementation NSDate (Timestamp)

+ (NSTimeInterval)currentTimeInterval {
    NSDate *now = [[NSDate alloc] init];
    NSTimeInterval ts = [now timeIntervalSince1970];
    [now release];
    return ts;
}

@end
