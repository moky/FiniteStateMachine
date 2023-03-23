//
//  sm_transition.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <string.h>

#include "sm_state.h"
#include "sm_transition.h"


sm_transition *sm_create_transition(sm_transition_evaluate evaluate)
{
    sm_transition *trans = (sm_transition *)malloc(sizeof(sm_transition));
    memset(trans, 0, sizeof(sm_transition));
    trans->evaluate = evaluate;
    return trans;
}

void sm_destroy_transition(sm_transition *trans)
{
    // trans->evaluate = NULL;
    // trans->ctx = NULL;
    free(trans);
}
