//
//  fsm_transition.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <string.h>

#include "fsm_state.h"
#include "fsm_transition.h"


fsm_transition *fsm_create_transition(fsm_transition_evaluate evaluate)
{
	fsm_transition *trans = (fsm_transition *)malloc(sizeof(fsm_transition));
	memset(trans, 0, sizeof(fsm_transition));
    trans->evaluate = evaluate;
	return trans;
}

void fsm_destroy_transition(fsm_transition *trans)
{
    // trans->evaluate = NULL;
    // trans->ctx = NULL;
	free(trans);
}
