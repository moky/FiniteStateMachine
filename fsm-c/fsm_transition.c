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


fsm_transition *fsm_create_transition(const char *target, fsm_transition_evaluate evaluate)
{
	fsm_transition *trans = (fsm_transition *)malloc(sizeof(fsm_transition));
	memset(trans, 0, sizeof(fsm_transition));
	if (target != NULL) {
        fsm_set_name(trans->target, target);
	}
    trans->evaluate = evaluate;
	return trans;
}

void fsm_destroy_transition(fsm_transition *trans)
{
    // trans->evaluate = NULL;
    // trans->ctx = NULL;
	free(trans);
}

void fsm_rename_transition(fsm_transition *trans, const char *target)
{
    if (target == NULL) {
        fsm_erase_name(trans->target);
    } else {
        fsm_set_name(trans->target, target);
    }
}
