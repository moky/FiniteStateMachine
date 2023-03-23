//
//  sm_machine.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-12.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_machine__
#define __fsm_machine__

#include "sm_protocol.h"


sm_machine *sm_create_machine(unsigned int capacity);
void sm_destroy_machine(sm_machine *machine);

// states
const sm_state *sm_add_state  (sm_machine *machine, const sm_state *state);
sm_state *sm_get_state        (const sm_machine *machine, unsigned int index);
sm_state *sm_get_default_state(const sm_machine *machine);
sm_state *sm_get_target_state (const sm_machine *machine, const sm_transition *trans);
sm_state *sm_get_current_state(const sm_machine *machine);

// actions
void sm_start_machine(sm_machine *machine, const sm_time now);
void sm_stop_machine(sm_machine *machine, const sm_time now);
void sm_pause_machine(sm_machine *machine, const sm_time now);
void sm_resume_machine(sm_machine *machine, const sm_time now);
void sm_tick_machine(sm_machine *machine, const sm_time now, const sm_time elapsed);

#endif /* defined(__fsm_machine__) */
