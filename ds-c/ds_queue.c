//
//  ds_queue.c
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "ds_queue.h"

#pragma mark Queue base on ds_chain_table

ds_chain_queue * ds_chain_queue_create(void)
{
    return ds_chain_create();
}

void ds_chain_queue_destroy(ds_chain_queue * queue)
{
    ds_chain_destroy(queue);
}

ds_size ds_chain_queue_length(const ds_chain_queue * queue)
{
    return ds_chain_length(queue);
}

ds_bool ds_chain_queue_empty(const ds_chain_queue * queue)
{
    return ds_chain_empty(queue);
}

void ds_chain_queue_clear(ds_chain_queue * queue)
{
    ds_chain_clear(queue);
}

void ds_chain_queue_push(ds_chain_queue * queue,
                         const ds_data data, const ds_size data_size)
{
    ds_chain_append(queue, data, data_size);
}

ds_chain_queue_node * ds_chain_queue_shift(ds_chain_queue * queue)
{
    return ds_chain_shift(queue);
}

void ds_chain_queue_node_destroy(ds_chain_queue_node * node)
{
    ds_chain_node_destroy(node);
}

ds_chain_queue * ds_chain_queue_copy(const ds_chain_queue * queue,
                                     const ds_size data_size)
{
    return ds_chain_copy(queue, data_size);
}

#pragma mark - Circular queue base on ds_array

static inline void _circular_queue_expand(ds_circular_queue * queue)
{
    ds_size middle = queue->capacity;
    queue->capacity *= 2;
    queue->items = (ds_data *)realloc(queue->items, queue->capacity * queue->item_size);
    
    // move part 2 of items
    if (queue->tail < queue ->head) {
	    // cycled queue
	    if (queue->tail == 0) {
    	    // part 2 is empty, move tail pointer
    	    queue->tail = middle;
	    } else {
    	    // move the part 2 to new zone(connected to part 1)
    	    ds_byte * src = (ds_byte *)queue->items;
    	    ds_byte * dest = src + middle * queue->item_size;
    	    memcpy(dest, src, queue->tail * queue->item_size);
    	    // move tail pointer
    	    queue->tail += middle;
	    }
    }
}

static inline void _circular_queue_assign(const ds_circular_queue * queue,
                                          ds_data * dest, const ds_data src)
{
    if (queue->fn.assign) {
	    queue->fn.assign(dest, src, queue->item_size);
    } else if (queue->bk.assign) {
	    queue->bk.assign(dest, src, queue->item_size);
    } else {
	    memcpy(dest, &src, queue->item_size);
    }
}

//static inline void _circular_queue_erase(const ds_circular_queue * queue,
//                                         ds_data * ptr)
//{
//    if (queue->fn.erase) {
//	    queue->fn.erase(ptr, queue->item_size);
//    } else if (queue->bk.erase) {
//	    queue->bk.erase(ptr, queue->item_size);
//    } else {
//	    bzero(ptr, queue->item_size);
//    }
//}

#pragma mark -

ds_circular_queue * ds_circular_queue_create(const ds_size item_size,
                                             const ds_size capacity)
{
    ds_circular_queue * queue = (ds_circular_queue *)malloc(sizeof(ds_circular_queue));
    memset(queue, 0, sizeof(ds_circular_queue));
    queue->capacity = capacity > 0 ? capacity : 8;
    queue->item_size = item_size > 0 ? item_size : sizeof(ds_data);
    queue->items = (ds_data *)calloc(queue->capacity, queue->item_size);
    return queue;
}

void ds_circular_queue_destroy(ds_circular_queue * queue)
{
    //_circular_queue_erase_all(queue);
    free(queue->items);
    queue->items = NULL;
    free(queue);
}

ds_size ds_circular_queue_length(const ds_circular_queue * queue)
{
    if (queue->tail < queue->head) {
	    return queue->capacity - queue->head + queue->tail;
    } else {
	    return queue->tail - queue->head;
    }
}

ds_bool ds_circular_queue_empty(const ds_circular_queue * queue)
{
    return queue->tail == queue->head;
}

void ds_circular_queue_clear(ds_circular_queue * queue)
{
    queue->head = 0;
    queue->tail = 0;
}

void ds_circular_queue_push(ds_circular_queue * queue, const ds_data item)
{
    ds_size count = ds_circular_queue_length(queue);
    if (count + 1 >= queue->capacity) {
	    // only ONE space left, expand the queue
        _circular_queue_expand(queue);
    }
    
    // append item to tail
    ds_byte * ptr = (ds_byte *)queue->items;
    ptr += queue->tail * queue->item_size;
    _circular_queue_assign(queue, (ds_data *)ptr, item);
    
    // move the tail circularly
    queue->tail += 1;
    if (queue->tail >= queue->capacity) {
	    queue->tail = 0;
    }
}

ds_data * ds_circular_queue_shift(ds_circular_queue * queue)
{
    if (queue->head == queue->tail) {
	    // empty queue
	    return NULL;
    }
    
    // remove the head item
    ds_byte * ptr = (ds_byte *)queue->items;
    ptr += queue->head * queue->item_size;
    //_erase(queue, (ds_data *)ptr, queue->item_size);
    
    // circularly
    queue->head += 1;
    if (queue->head >= queue->capacity) {
	    queue->head = 0;
    }
    
    return (ds_data *)ptr;
}

ds_circular_queue * ds_circular_queue_copy(const ds_circular_queue * queue)
{
    ds_size capacity = ds_circular_queue_length(queue) + 1;
    ds_circular_queue * new_queue = ds_circular_queue_create(queue->item_size, capacity);
    
    new_queue->fn.assign = queue->fn.assign;
    new_queue->fn.erase  = queue->fn.erase;
    new_queue->bk.assign = queue->bk.assign;
    new_queue->bk.erase  = queue->bk.erase;
    
    ds_data item;
    ds_size index;
    DS_CIRCULAR_QUEUE_FOR_EACH_ITEM(queue, item, index) {
        ds_circular_queue_push(new_queue, item);
    }
    
    return new_queue;
}

#pragma mark - Default queue

ds_queue * ds_queue_create(const ds_size item_size,
                           const ds_size capacity)
{
    return ds_circular_queue_create(item_size, capacity);
}

void ds_queue_push(ds_queue * queue,
                   const ds_data data, const ds_size data_size)
{
    ds_circular_queue_push(queue, data);
}

ds_data ds_queue_node_data(const ds_queue_node * node)
{
    return *node;
}

void ds_queue_node_destroy(ds_queue_node * node)
{
    // do nothing
}

ds_queue * ds_queue_copy(const ds_queue * queue, const ds_size data_size)
{
    return ds_circular_queue_copy(queue);
}
