//
//  fsm_state.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <string.h>

#include "fsm_chain_table.h"
#include "fsm_machine.h"
#include "fsm_transition.h"
#include "fsm_state.h"

void fsm_set_name(char *dst, const char *src)
{
    unsigned long len = strlen(src);
    if (len >= FSM_MAX_NAME_LENGTH) {
        len = FSM_MAX_NAME_LENGTH - 1;
    }
    strncpy(dst, src, len);
}

void fsm_erase_name(char *dst)
{
    memset(dst, 0, FSM_MAX_NAME_LENGTH);
}


fsm_state * fsm_create_state(const char *name)
{
    struct _fsm_state *state = (struct _fsm_state *)malloc(sizeof(struct _fsm_state));
	memset(state, 0, sizeof(fsm_state));
	if (name != NULL) {
        fsm_set_name(state->name, name);
	}
    state->transitions = fsm_chain_create();
    state->evaluate = fsm_tick_state;
	return state;
}

void fsm_destroy_state(fsm_state *state)
{
	// 1. destroy the chain table for transitions
	fsm_chain_destroy(state->transitions);
    
    // state->transitions = NULL;
    // state->ctx = NULL;
	
	// 2. free the state
	free(state);
}

void fsm_rename_state(fsm_state *state, const char *name)
{
    if (name == NULL) {
        fsm_erase_name(state->name);
    } else {
        fsm_set_name(state->name, name);
    }
}

void fsm_add_transition(fsm_state *state, const fsm_transition *trans)
{
	fsm_chain_add(state->transitions, trans);
}

// state evaluate
const struct _fsm_transition *fsm_tick_state(const fsm_state   *state,
                                             const fsm_context *ctx,
                                             const fsm_time     now)
{
	fsm_chain_node * node;
	fsm_transition * trans;
	DS_FOR_EACH_CHAIN_NODE(state->transitions, node) {
		trans = fsm_chain_get(node);
		if (trans->evaluate(trans, ctx, now) != FSMFalse) {
            // OK, get target state from this transition
            return trans;
		}
	}
    return NULL;
}
