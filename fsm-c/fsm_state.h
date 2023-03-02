//
//  fsm_state.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_state__
#define __fsm_state__

#include "fsm_protocol.h"


void fsm_set_name(char *dst, const char *src);
void fsm_erase_name(char *dst);


fsm_state *fsm_create_state(const char *name);
void fsm_destroy_state(fsm_state *state);

void fsm_rename_state(fsm_state *state, const char *name);

void fsm_add_transition(fsm_state *state, const fsm_transition *trans);

// state evaluate
const struct _fsm_transition *fsm_tick_state(const fsm_state   *state,
                                             const fsm_context *machine,
                                             const fsm_time     now);


#endif /* defined(__fsm_state__) */
