//
//  fsm_machine.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-12.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_machine__
#define __fsm_machine__

#include "fsm_protocol.h"


fsm_machine *fsm_create_machine(const char *default_state);
void fsm_destroy_machine(fsm_machine *machine);

void fsm_set_default_name(fsm_machine *machine, const char *default_state);

// states
void fsm_add_state(fsm_machine *machine, const fsm_state *state);
fsm_state *fsm_get_state(const fsm_machine *machine, const char *name, unsigned int *index);
fsm_state *fsm_get_default_state(const fsm_machine *machine, unsigned int *index);
fsm_state *fsm_get_target_state(const fsm_machine *machine, const fsm_transition *trans, unsigned int *index);
fsm_state *fsm_get_current_state(const fsm_machine *machine);

///**
// *  Exit current state, and enter new state
// *
// * @param next - next state
// * @param now  - current time (milliseconds, from Jan 1, 1970 UTC)
// */
//fsm_bool fsm_change_state(fsm_machine *machine, const fsm_state *next, const fsm_time now);

// actions
void fsm_start_machine(fsm_machine *machine, const fsm_time now);
void fsm_stop_machine(fsm_machine *machine, const fsm_time now);
void fsm_pause_machine(fsm_machine *machine, const fsm_time now);
void fsm_resume_machine(fsm_machine *machine, const fsm_time now);
void fsm_tick_machine(fsm_machine *machine, const fsm_time now, const fsm_time elapsed);

#endif /* defined(__fsm_machine__) */
