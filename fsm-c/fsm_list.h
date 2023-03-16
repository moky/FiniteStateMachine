//
//  fsm_list.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_list__
#define __fsm_list__

#include "fsm_protocol.h"

fsm_list *fsm_list_create(unsigned int capacity);
void fsm_list_destroy(fsm_list *list);

// get length of list
unsigned int fsm_list_length(const fsm_list *list);

// get item value at index
fsm_list_item fsm_list_get(const fsm_list *list, int index);

// set item value at index
void fsm_list_set(fsm_list *list, int index, const fsm_list_item item);

// append item value to the tail
void fsm_list_add(fsm_list *list, const fsm_list_item item);

#endif /* defined(__fsm_list__) */
