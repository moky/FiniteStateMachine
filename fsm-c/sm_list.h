//
//  sm_list.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_list__
#define __fsm_list__

#include "sm_protocol.h"

sm_list *sm_list_create(unsigned int capacity);
void sm_list_destroy(sm_list *list);

// get length of list
unsigned int sm_list_length(const sm_list *list);

// get item value at index
sm_list_item sm_list_get(const sm_list *list, int index);

// set item value at index
void sm_list_set(sm_list *list, int index, const sm_list_item item);

// append item value to the tail
void sm_list_add(sm_list *list, const sm_list_item item);

#endif /* defined(__fsm_list__) */
