//
//  sm_delegate.c
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/2.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#include <string.h>

#include "sm_delegate.h"


sm_delegate *sm_create_delegate(void)
{
    sm_delegate *delegate = (sm_delegate *)malloc(sizeof(sm_delegate));
    memset(delegate, 0, sizeof(sm_transition));
    return delegate;
}

void sm_destroy_delegate(sm_delegate *delegate)
{
    free(delegate);
}
