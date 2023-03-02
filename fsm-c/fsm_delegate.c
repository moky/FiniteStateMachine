//
//  fsm_delegate.c
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/2.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#include <string.h>

#include "fsm_delegate.h"


fsm_delegate *fsm_create_delegate(void)
{
    fsm_delegate *delegate = (fsm_delegate *)malloc(sizeof(fsm_delegate));
    memset(delegate, 0, sizeof(fsm_transition));
    return delegate;
}

void fsm_destroy_delegate(fsm_delegate *delegate)
{
    free(delegate);
}
