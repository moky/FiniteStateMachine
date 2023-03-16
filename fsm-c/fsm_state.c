//
//  fsm_state.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <string.h>

#include "fsm_list.h"
#include "fsm_machine.h"
#include "fsm_transition.h"
#include "fsm_state.h"


fsm_state * fsm_create_state(fsm_state_evaluate evaluate, unsigned int capacity)
{
    struct _fsm_state *state = (struct _fsm_state *)malloc(sizeof(struct _fsm_state));
    memset(state, 0, sizeof(fsm_state));
    if (evaluate == NULL) {
        evaluate = fsm_tick_state;
    }
    state->transitions = fsm_list_create(capacity);
    state->evaluate = evaluate;
    return state;
}

void fsm_destroy_state(fsm_state *state)
{
    // 1. destroy the chain table for transitions
    fsm_list_destroy(state->transitions);
    
    // state->transitions = NULL;
    // state->ctx = NULL;
    
    // 2. free the state
    free(state);
}

void fsm_add_transition(fsm_state *state, const fsm_transition *trans)
{
    fsm_list_add(state->transitions, (fsm_list_item)trans);
}

// state evaluate
const struct _fsm_transition *fsm_tick_state(const fsm_state   *state,
                                             const fsm_context *ctx,
                                             const fsm_time     now)
{
    fsm_transition * trans;
    unsigned int len = fsm_list_length(state->transitions);
    for (unsigned int index = 0; index < len; ++index) {
        trans = fsm_list_get(state->transitions, index);
        if (trans->evaluate(trans, ctx, now) != FSMFalse) {
            // OK, get target state from this transition
            return trans;
        }
    }
    return NULL;
}
