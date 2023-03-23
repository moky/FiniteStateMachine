//
//  sm_list.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-13.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "sm_list.h"

#define SM_VALUE(item)    (sm_list_item)(*item)

#if sm_list_type == sm_array_list

#pragma mark - SM list base on ds_array

sm_list * sm_list_create(unsigned int capacity)
{
    return ds_array_create(sizeof(sm_list_item), capacity);
}

void sm_list_destroy(sm_list *list)
{
    ds_array_destroy(list);
}

unsigned int sm_list_length(const sm_list *list)
{
    return (unsigned int)list->count;
}

sm_list_item sm_list_get(const sm_list *list, int index)
{
    ds_data * data = ds_array_at(list, index);
    if (data == NULL) {
        return NULL;
    }
    return SM_VALUE(data);
}

void sm_list_set(sm_list *list, int index, const sm_list_item item)
{
    ds_array_assign(list, index, (ds_data)item);
}

void sm_list_add(sm_list *list, const sm_list_item item)
{
    ds_array_append(list, (ds_data)item);
}

#elif sm_list_type == sm_chain_list

#pragma mark - SM list base on ds_chain_table

sm_list * sm_list_create(unsigned int capacity)
{
    return ds_chain_create();
}

void sm_list_destroy(sm_list *list)
{
    ds_chain_destroy(list);
}

unsigned int sm_list_length(const sm_list *list)
{
    return (unsigned int)ds_chain_length(list);
}

sm_list_item sm_list_get(const sm_list *list, int index)
{
    ds_chain_node * node = ds_chain_at(list, index);
    if (node == NULL) {
        return NULL;
    }
    return SM_VALUE(node->data);
}

void sm_list_set(sm_list *list, int index, const sm_list_item item)
{
    ds_size len = sm_list_length(list);
    // fill the gaps
    for (; len < index; ++len) {
        ds_chain_append(list, 0, sizeof(sm_list_item));
    }
    if (index < len) {
        // update node->data
        ds_chain_node *node = ds_chain_at(list, index);
        ds_chain_assign(list, node, (ds_data)item, sizeof(sm_list_item));
    } else {
        // append to tail
        ds_chain_append(list, (ds_data)item, sizeof(sm_list_item));
    }
}

void sm_list_add(sm_list *list, const sm_list_item item)
{
    ds_chain_append(list, (ds_data)item, sizeof(sm_list_item));
}

#endif
