//
//  fsm_list.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "fsm_list.h"

#define FSM_VALUE(item)    (fsm_list_item)(*item)

#if fsm_list_type == fsm_array_list

#pragma mark - FSM list base on ds_array

fsm_list * fsm_list_create(unsigned int capacity)
{
    return ds_array_create(sizeof(fsm_list_item), capacity);
}

void fsm_list_destroy(fsm_list *list)
{
    ds_array_destroy(list);
}

unsigned int fsm_list_length(const fsm_list *list)
{
    return (unsigned int)list->count;
}

fsm_list_item fsm_list_get(const fsm_list *list, int index)
{
    ds_data * data = ds_array_at(list, index);
    if (data == NULL) {
        return NULL;
    }
    return FSM_VALUE(data);
}

void fsm_list_set(fsm_list *list, int index, const fsm_list_item item)
{
    ds_array_assign(list, index, (ds_data)item);
}

void fsm_list_add(fsm_list *list, const fsm_list_item item)
{
    ds_array_append(list, (ds_data)item);
}

#elif fsm_list_type == fsm_chain_list

#pragma mark - FSM list base on ds_chain_table

fsm_list * fsm_list_create(unsigned int capacity)
{
    return ds_chain_create();
}

void fsm_list_destroy(fsm_list *list)
{
    ds_chain_destroy(list);
}

unsigned int fsm_list_length(const fsm_list *list)
{
    return (unsigned int)ds_chain_length(list);
}

fsm_list_item fsm_list_get(const fsm_list *list, int index)
{
    ds_chain_node * node = ds_chain_at(list, index);
    if (node == NULL) {
        return NULL;
    }
    return FSM_VALUE(node->data);
}

void fsm_list_set(fsm_list *list, int index, const fsm_list_item item)
{
    ds_size len = fsm_list_length(list);
    // fill the gaps
    for (; len < index; ++len) {
        ds_chain_append(list, 0, sizeof(fsm_list_item));
    }
    if (index < len) {
        // update node->data
        ds_chain_node *node = ds_chain_at(list, index);
        ds_chain_assign(list, node, (ds_data)item, sizeof(fsm_list_item));
    } else {
        // append to tail
        ds_chain_append(list, (ds_data)item, sizeof(fsm_list_item));
    }
}

void fsm_list_add(fsm_list *list, const fsm_list_item item)
{
    ds_chain_append(list, (ds_data)item, sizeof(fsm_list_item));
}

#endif
