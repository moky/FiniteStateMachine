//
//  sm_state.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <string.h>

#include "sm_list.h"
#include "sm_machine.h"
#include "sm_transition.h"
#include "sm_state.h"


sm_state * sm_create_state(sm_state_evaluate evaluate, unsigned int capacity)
{
    struct _sm_state *state = (struct _sm_state *)malloc(sizeof(struct _sm_state));
    memset(state, 0, sizeof(sm_state));
    if (evaluate == NULL) {
        evaluate = sm_tick_state;
    }
    state->transitions = sm_list_create(capacity);
    state->evaluate = evaluate;
    return state;
}

void sm_destroy_state(sm_state *state)
{
    // 1. destroy the chain table for transitions
    sm_list_destroy(state->transitions);
    
    // state->transitions = NULL;
    // state->ctx = NULL;
    
    // 2. free the state
    free(state);
}

void sm_add_transition(sm_state *state, const sm_transition *trans)
{
    sm_list_add(state->transitions, (sm_list_item)trans);
}

// state evaluate
const struct _sm_transition *sm_tick_state(const sm_state   *state,
                                           const sm_context *ctx,
                                           const sm_time     now)
{
    sm_transition * trans;
    unsigned int len = sm_list_length(state->transitions);
    for (unsigned int index = 0; index < len; ++index) {
        trans = sm_list_get(state->transitions, index);
        if (trans->evaluate(trans, ctx, now) != SMFalse) {
            // OK, get target state from this transition
            return trans;
        }
    }
    return NULL;
}
