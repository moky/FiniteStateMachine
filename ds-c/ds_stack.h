//
//  ds_stack.h
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#ifndef __ds_stack__
#define __ds_stack__

#include "ds_array.h"
#include "ds_chain.h"

#pragma mark Stack base on ds_chain_table

typedef ds_chain_node   ds_chain_stack_node;
typedef ds_chain_table  ds_chain_stack;

/**
 *  create a stack
 */
ds_chain_stack * ds_chain_stack_create(void);

/**
 *  destroy the stack
 */
void ds_chain_stack_destroy(ds_chain_stack * stack);

/**
 *  get length of the stack
 */
ds_size ds_chain_stack_length(const ds_chain_stack * stack);

/**
 *  check whether the stack is empty
 */
ds_bool ds_chain_stack_empty(const ds_chain_stack * stack);

/**
 *  clear the stack
 */
void ds_chain_stack_clear(ds_chain_stack * stack);

/**
 *  add item data to top of stack (chain head)
 */
void ds_chain_stack_push(ds_chain_stack * stack,
                         const ds_data data, const ds_size data_size);

/**
 *  remove top item from the stack and return it,
 *  this node will no longer retain by the queue, so you should destroy it manually
 */
ds_chain_stack_node * ds_chain_stack_pop(ds_chain_stack * stack);

/**
 *  get top item (not removed)
 */
ds_chain_stack_node * ds_chain_stack_top(const ds_chain_stack * stack);

/**
 *  destroy the node (this node must be removed from the stack already)
 */
void ds_chain_stack_node_destroy(ds_chain_stack_node * node);

/**
 *  copy the stack
 */
ds_chain_stack * ds_chain_stack_copy(const ds_chain_stack * stack,
                                     const ds_size data_size);

#pragma mark - Stack base on ds_array

typedef ds_data         ds_array_stack_node;
typedef ds_array        ds_array_stack;

/**
 *  create a stack struct with item size and capacity
 */
ds_array_stack * ds_array_stack_create(const ds_size item_size,
                                       const ds_size capacity);

/**
 *  destroy the stack struct and erase all items
 */
void ds_array_stack_destroy(ds_array_stack * stack);

/**
 *  get stack->count
 */
ds_size ds_array_stack_length(const ds_array_stack * stack);

/**
 *  check stack->count == 0
 */
ds_bool ds_array_stack_empty(const ds_array_stack * stack);

/**
 *  set stack->count = 0
 */
void ds_array_stack_clear(ds_array_stack * stack);

/**
 *  push item to top of stack
 */
void ds_array_stack_push(ds_array_stack * stack, const ds_data item);

/**
 *  remove top item from the stack and return it (but NOT erase)
 */
ds_array_stack_node * ds_array_stack_pop(ds_array_stack * stack);

/**
 *  get top item (not removed)
 */
ds_array_stack_node * ds_array_stack_top(const ds_array_stack * stack);

/**
 *  copy stack, the new_stack->capacity = old_stack->count
 */
ds_array_stack * ds_array_stack_copy(const ds_array_stack * stack);

#pragma mark - Default stack

typedef ds_array_stack_node ds_stack_node;
typedef ds_array_stack      ds_stack;

ds_stack * ds_stack_create(const ds_size item_size,
                           const ds_size capacity);

#define ds_stack_destroy(stack)  ds_array_stack_destroy(stack)

#define ds_stack_length(stack)   ds_array_stack_length(stack)

#define ds_stack_empty(stack)    ds_array_stack_empty(stack)

#define ds_stack_clear(stack)    ds_array_stack_clear(stack)

void ds_stack_push(ds_stack * stack,
                   const ds_data data, const ds_size data_size);

#define ds_stack_pop(stack)      ds_array_stack_pop(stack)

#define ds_stack_top(stack)      ds_array_stack_top(stack)

/**
 *  get data from the node
 */
ds_data ds_stack_node_data(const ds_stack_node * node);

/**
 *  no need to destroy array stack node here, jost for compatible with chain stack
 */
void ds_stack_node_destroy(ds_stack_node * node);

ds_stack * ds_stack_copy(const ds_stack * stack, const ds_size data_size);

#endif /* defined(__ds_stack__) */
