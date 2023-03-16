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

ds_stack * ds_stack_create(ds_size item_size, ds_size capacity)
{
    return ds_array_create(item_size, capacity);
}

void ds_stack_destroy(ds_stack * stack)
{
    ds_array_destroy(stack);
}

void ds_stack_push(ds_stack * stack, const ds_data item)
{
    ds_array_append(stack, item);
}

ds_data * ds_stack_pop(ds_stack * stack)
{
    if (stack->count <= 0) {
	    // stack empty
	    return NULL;
    }
    ds_data * top = ds_array_at(stack, stack->count - 1);
    stack->count -= 1; // remove the top item, but NOT erase it
    return top;
}

ds_data * ds_stack_top(const ds_stack * stack)
{
    if (stack->count <= 0) {
	    // stack empty
	    return NULL;
    }
    // return the last item
    return ds_array_at(stack, stack->count - 1);
}

ds_stack * ds_stack_copy(const ds_stack * stack)
{
    return ds_array_copy(stack);
}
