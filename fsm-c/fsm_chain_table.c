//
//  fsm_chain_table.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "fsm_chain_table.h"

fsm_chain_table * fsm_chain_create()
{
	return ds_chain_create(sizeof(void *));
}

void fsm_chain_destroy(fsm_chain_table *chain)
{
	ds_chain_destroy(chain);
}

unsigned int fsm_chain_length(const fsm_chain_table *chain)
{
    return (unsigned int)ds_chain_length(chain);
}

fsm_chain_node *fsm_chain_at(fsm_chain_table *chain, unsigned int index)
{
	if (index == FSMNotFound) {
		return NULL;
	}
    return ds_chain_at(chain, index);
}

void fsm_chain_add(fsm_chain_table *chain, const void *element)
{
    // save the element's address, no need to copy the element
    if (element == NULL) {
        ds_chain_insert(chain, NULL, chain->tail);
    } else {
        ds_chain_insert(chain, (ds_type *)&element, chain->tail);
    }
}

void *fsm_chain_get(const fsm_chain_node *node)
{
	if (node == NULL) {
		return NULL;
	}
	// the data saved is the element's address,
	// here return the element
    void **ptr = (void **)node->data;
	return ptr ? *ptr : NULL;
}

void fsm_chain_set(fsm_chain_node *node, const void *element)
{
    node->data = (ds_type *)&element;
}
