//
//  sm_delegate.h
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/2.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#ifndef sm_delegate_h
#define sm_delegate_h

#include "sm_protocol.h"

sm_delegate *sm_create_delegate(void);
void sm_destroy_delegate(sm_delegate *delegate);

#endif /* sm_delegate_h */
