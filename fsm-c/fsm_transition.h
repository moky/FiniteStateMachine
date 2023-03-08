//
//  fsm_transition.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_transition__
#define __fsm_transition__

#include "fsm_protocol.h"


fsm_transition *fsm_create_transition(fsm_transition_evaluate evaluate);
void fsm_destroy_transition(fsm_transition *trans);


#endif /* defined(__fsm_transition__) */
