// license: https://mit-license.org
//
//  FSM : Finite State Machine
//
//                               Written in 2019 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2019 Albert Moky
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
//  FiniteStateMachine.h
//  FiniteStateMachine
//
//  Created by Albert Moky on 2019/3/7.
//  Copyright © 2019 DIM Group. All rights reserved.
//

#import <Foundation/Foundation.h>

//! Project version number for FiniteStateMachine.
FOUNDATION_EXPORT double FiniteStateMachineVersionNumber;

//! Project version string for FiniteStateMachine.
FOUNDATION_EXPORT const unsigned char FiniteStateMachineVersionString[];

// In this header, you should import all the public headers of your framework using statements like #import <FiniteStateMachine/PublicHeader.h>

#if !defined(__FINITE_STATE_MACHINE__)
#define __FINITE_STATE_MACHINE__ 1

//
//  threading
//
#import <FiniteStateMachine/SMThread.h>
#import <FiniteStateMachine/SMRunner.h>
#import <FiniteStateMachine/SMMetronome.h>

//
//  SM
//
#import <FiniteStateMachine/SMProtocol.h>

#import <FiniteStateMachine/SMTransition.h>
#import <FiniteStateMachine/SMFunctionTransition.h>
#import <FiniteStateMachine/SMBlockTransition.h>

#import <FiniteStateMachine/SMState.h>

#import <FiniteStateMachine/SMMachine.h>
#import <FiniteStateMachine/SMAutoMachine.h>

#endif /* ! __FINITE_STATE_MACHINE__ */
