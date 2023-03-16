//
//  ds_queue.h
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#ifndef __ds_queue__
#define __ds_queue__

#include "ds_chain.h"

#pragma mark Queue base on ds_chain_table

typedef ds_chain_node   ds_chain_queue_node;
typedef ds_chain_table  ds_chain_queue;

/**
 *  create a queue struct
 */
ds_chain_queue * ds_chain_queue_create(void);

/**
 *  destroy the queue
 */
void ds_chain_queue_destroy(ds_chain_queue * queue);

/**
 *  get length of the queue
 */
ds_size ds_chain_queue_length(const ds_chain_queue * queue);

/**
 * check whether the queue is empty
 */
ds_bool ds_chain_queue_empty(const ds_chain_queue * queue);

/**
 *  clear the queue
 */
void ds_chain_queue_clear(ds_chain_queue * queue);

/**
 *  append the item data to tail of the queue
 */
void ds_chain_queue_push(ds_chain_queue * queue,
                         const ds_data data, const ds_size data_size);

/**
 *  remove head item from the queue and return it,
 *  this node will no longer retain by the queue, so you should destroy it manually
 */
ds_chain_queue_node * ds_chain_queue_shift(ds_chain_queue * queue);

/**
 *  destroy the node (this node must be removed from the queue already)
 */
void ds_chain_queue_node_destroy(ds_chain_queue_node * node);

/**
 *  copy the queue
 */
ds_chain_queue * ds_chain_queue_copy(const ds_chain_queue * queue,
                                     const ds_size data_size);

#pragma mark - Circular queue base on ds_array

#define ds_circular_queue_at(queue, index)                                     \
    ({                                                                         \
        ds_byte * __ptr = (ds_byte *)((queue)->items);                         \
        (ds_data *)(__ptr + (queue)->item_size *                               \
            (((queue)->head + (index)) < (queue)->capacity ?                   \
                (queue)->head + (index) :                                      \
                (queue)->head + (index) - (queue)->capacity));                 \
    })                                                                         \
                                                /* EOF 'ds_circular_queue_at' */

#define DS_CIRCULAR_QUEUE_FOR_EACH_ITEM(queue, item, index)                    \
    for ((index) = 0;                                                          \
         (item) = (__typeof__(item))ds_circular_queue_at(queue, index),        \
             (index) < ds_circular_queue_length(queue);                                 \
         ++(index))                                                            \
                                     /* EOF 'DS_CIRCULAR_QUEUE_FOR_EACH_ITEM' */

#define DS_CIRCULAR_QUEUE_FOR_EACH_ITEM_REVERSE(array, item, index)            \
    for ((index) = ds_circular_queue_length(queue);                                     \
         (item) = (__typeof__(item))ds_circular_queue_at(queue, (index) - 1),  \
             (index)-- > 0;                                                    \
         )                                                                     \
                             /* EOF 'DS_CIRCULAR_QUEUE_FOR_EACH_ITEM_REVERSE' */

//
//  Notice:
//      1. For improving performance, the data maybe saved circularly,
//         so please don't access it as an array.
//      2. For circularly algorithm needs, there is ONE space(s) never be used
//         in the 'queue->items', so 'ds_circular_queue_length(queue)' will always smaller
//         than the 'queue->capacity'
//
typedef struct _ds_circular_queue {
    
    ds_size capacity; // max length of items (ONE item space never used)
    ds_size head, tail; // offsets for head/tail pointer

    ds_size item_size;
    ds_data * items;
    
    // functions
    struct {
	    ds_assign_func   assign;
	    ds_erase_func    erase;
    } fn;
    // blocks
    struct {
	    ds_assign_block  assign;
	    ds_erase_block   erase;
    } bk;
} ds_circular_queue;

typedef ds_data         ds_circular_queue_node;

/**
 *  create a queue struct with item size and capacity
 */
ds_circular_queue * ds_circular_queue_create(const ds_size item_size,
                                             const ds_size capacity);

/**
 *  destroy the queue struct and its items
 */
void ds_circular_queue_destroy(ds_circular_queue * queue);

/**
 *  get items count
 */
ds_size ds_circular_queue_length(const ds_circular_queue * queue);

/**
 *  check queue->tail == queue->head
 */
ds_bool ds_circular_queue_empty(const ds_circular_queue * queue);

/**
 *  set queue->head = 0; queue->tail = 0;
 */
void ds_circular_queue_clear(ds_circular_queue * queue);

/**
 *  append the item data to tail of the queue
 */
void ds_circular_queue_push(ds_circular_queue * queue, const ds_data item);

/**
 *  remove head item from the queue and return it (but NOT erase)
 */
ds_circular_queue_node * ds_circular_queue_shift(ds_circular_queue * queue);

/**
 *  copy the queue, the new_queue->capacity = ds_circular_queue_length(queue) + 1
 *              the new_queue->head = 0
 */
ds_circular_queue * ds_circular_queue_copy(const ds_circular_queue * queue);

#pragma mark - Default queue

typedef ds_circular_queue_node ds_queue_node;
typedef ds_circular_queue      ds_queue;

ds_queue * ds_queue_create(const ds_size item_size,
                           const ds_size capacity);

#define ds_queue_destroy(queue) ds_circular_queue_destroy(queue)

#define ds_queue_length(queue)  ds_circular_queue_length(queue)

#define ds_queue_empty(queue)   ds_circular_queue_empty(queue)

#define ds_queue_clear(queue)   ds_circular_queue_clear(queue)

void ds_queue_push(ds_queue * queue,
                   const ds_data data, const ds_size data_size);

#define ds_queue_shift(queue)   ds_circular_queue_shift(queue)

/**
 *  get data from the node
 */
ds_data ds_queue_node_data(const ds_queue_node * node);

/**
 *  no need to destroy circular queue node here, just for compatible with chain queue
 */
void ds_queue_node_destroy(ds_queue_node * node);

ds_queue * ds_queue_copy(const ds_queue * queue, const ds_size data_size);

#endif /* defined(__ds_queue__) */
