//
//  sm_state.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_state__
#define __fsm_state__

#include "sm_protocol.h"


sm_state *sm_create_state(sm_state_evaluate evaluate, unsigned int capacity);
void sm_destroy_state(sm_state *state);

void sm_add_transition(sm_state *state, const sm_transition *trans);

// state evaluate
const struct _fsm_transition *sm_tick_state(const sm_state   *state,
                                             const sm_context *machine,
                                             const sm_time     now);


#endif /* defined(__fsm_state__) */
