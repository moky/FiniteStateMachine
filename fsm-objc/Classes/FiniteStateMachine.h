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

#import <FiniteStateMachine/FSMProtocol.h>

#import <FiniteStateMachine/FSMTransition.h>
#import <FiniteStateMachine/FSMFunctionTransition.h>
#import <FiniteStateMachine/FSMBlockTransition.h>

#import <FiniteStateMachine/FSMState.h>

#import <FiniteStateMachine/FSMMachine.h>
#import <FiniteStateMachine/FSMAutoMachine.h>

#endif /* ! __FINITE_STATE_MACHINE__ */
