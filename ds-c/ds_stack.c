//
//  ds_stack.c
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "ds_stack.h"

#pragma mark Stack base on ds_chain_table

ds_chain_stack * ds_chain_stack_create(void)
{
    return ds_chain_create();
}

void ds_chain_stack_destroy(ds_chain_stack * stack)
{
    ds_chain_destroy(stack);
}

ds_size ds_chain_stack_length(const ds_chain_stack * stack)
{
    return ds_chain_length(stack);
}

ds_bool ds_chain_stack_empty(const ds_chain_stack * stack)
{
    return ds_chain_empty(stack);
}

void ds_chain_stack_clear(ds_chain_stack * stack)
{
    ds_chain_clear(stack);
}

void ds_chain_stack_push(ds_chain_stack * stack,
                         const ds_data data, const ds_size data_size)
{
    // insert after 'NULL', which means this node will be the head
    ds_chain_insert(stack, NULL, data, data_size);
}

ds_chain_stack_node * ds_chain_stack_pop(ds_chain_stack * stack)
{
    return ds_chain_shift(stack);
}

ds_chain_stack_node * ds_chain_stack_top(const ds_chain_stack * stack)
{
    return stack->head;
}

void ds_chain_stack_node_destroy(ds_chain_stack_node * node)
{
    ds_chain_node_destroy(node);
}

ds_chain_stack * ds_chain_stack_copy(const ds_chain_stack * stack,
                                     const ds_size data_size)
{
    return ds_chain_copy(stack, data_size);
}

#pragma mark - Stack base on ds_array

ds_array_stack * ds_array_stack_create(ds_size item_size, ds_size capacity)
{
    return ds_array_create(item_size, capacity);
}

void ds_array_stack_destroy(ds_array_stack * stack)
{
    ds_array_destroy(stack);
}

ds_size ds_array_stack_length(const ds_array_stack * stack)
{
    return ds_array_length(stack);
}

ds_bool ds_array_stack_empty(const ds_array_stack * stack)
{
    return ds_array_empty(stack);
}

void ds_array_stack_clear(ds_array_stack * stack)
{
    ds_array_clear(stack);
}

void ds_array_stack_push(ds_array_stack * stack, const ds_data item)
{
    ds_array_append(stack, item);
}

ds_data * ds_array_stack_pop(ds_array_stack * stack)
{
    if (stack->count <= 0) {
	    // stack empty
	    return NULL;
    }
    ds_data * top = ds_array_at(stack, stack->count - 1);
    stack->count -= 1; // remove the top item, but NOT erase it
    return top;
}

ds_data * ds_array_stack_top(const ds_array_stack * stack)
{
    if (stack->count <= 0) {
	    // stack empty
	    return NULL;
    }
    // return the last item
    return ds_array_at(stack, stack->count - 1);
}

ds_array_stack * ds_array_stack_copy(const ds_array_stack * stack)
{
    return ds_array_copy(stack);
}

#pragma mark - Default stack

ds_stack * ds_stack_create(const ds_size item_size,
                           const ds_size capacity)
{
    return ds_array_stack_create(item_size, capacity);
}

void ds_stack_push(ds_stack * stack,
                   const ds_data data, const ds_size data_size)
{
    ds_array_stack_push(stack, data);
}

ds_data ds_stack_node_data(const ds_stack_node * node)
{
    return *node;
}

void ds_stack_node_destroy(ds_stack_node * node)
{
    // do nothing
}

ds_stack * ds_stack_copy(const ds_stack * stack, const ds_size data_size)
{
    return ds_array_stack_copy(stack);
}
