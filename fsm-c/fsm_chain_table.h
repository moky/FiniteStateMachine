//
//  fsm_chain_table.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_chain_table__
#define __fsm_chain_table__

#include "fsm_protocol.h"

fsm_chain_table *fsm_chain_create(void);
void fsm_chain_destroy(fsm_chain_table *chain);

// get length of chain
unsigned int fsm_chain_length(const fsm_chain_table *chain);
// get node at index
fsm_chain_node *fsm_chain_at(fsm_chain_table *chain, unsigned int index);
// append node with element
void fsm_chain_add(fsm_chain_table *chain, const void *element);

// get element from the node
void *fsm_chain_get(const fsm_chain_node *node);
// set element into the node
void fsm_chain_set(fsm_chain_node *node, const void *element);

#endif /* defined(__fsm_chain_table__) */
