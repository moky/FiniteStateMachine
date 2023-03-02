//
//  fsm_delegate.h
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/2.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#ifndef fsm_delegate_h
#define fsm_delegate_h

#include "fsm_protocol.h"

fsm_delegate *fsm_create_delegate(void);
void fsm_destroy_delegate(fsm_delegate *delegate);

#endif /* fsm_delegate_h */
