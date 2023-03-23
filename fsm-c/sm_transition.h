//
//  sm_transition.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_transition__
#define __fsm_transition__

#include "sm_protocol.h"


sm_transition *sm_create_transition(sm_transition_evaluate evaluate);
void sm_destroy_transition(sm_transition *trans);


#endif /* defined(__fsm_transition__) */
