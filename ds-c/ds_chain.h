//
//  ds_chain.h
//  DataStructure
//
//  Created by Moky on 15-8-25.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#ifndef __ds_chain__
#define __ds_chain__

#include "ds_base.h"

#define DS_CHAIN_FOR_EACH_ITEM(chain, node)                                    \
    for ((node) = (chain)->head; (node); (node) = (node)->next)                \
                                              /* EOF 'DS_CHAIN_FOR_EACH_ITEM' */

typedef struct _ds_chain_node {

    ds_size data_size; // size of the memory 'ds_chain_node->data' pointed to
    ds_data * data;
    
    struct _ds_chain_node * next;
} ds_chain_node;

typedef struct _ds_chain_table {
    
    ds_chain_node * head;
    ds_chain_node * tail;
    
    // functions
    struct {
	    ds_assign_func   assign;
	    ds_erase_func    erase;
	    ds_compare_func  compare;
    } fn;
    // blocks
    struct {
	    ds_assign_block  assign;
	    ds_erase_block   erase;
	    ds_compare_block compare;
    } bk;
} ds_chain_table;

/**
 *  create a chain table
 */
ds_chain_table * ds_chain_create(void);

/**
 *  destroy the chain table and its child nodes
 */
void ds_chain_destroy(ds_chain_table * chain);

/**
 *  get length of the chain
 */
ds_size ds_chain_length(const ds_chain_table * chain);

/**
 *  check chain->head == NULL
 */
ds_bool ds_chain_empty(const ds_chain_table * chain);

/**
 *  destroy all nodes
 */
void ds_chain_clear(ds_chain_table * chain);

/**
 *  assign data to the node (data should not be NULL)
 */
void ds_chain_assign(const ds_chain_table * chain,
                     ds_chain_node * node,
                     const ds_data data, const ds_size data_size);

/**
 *  erase data in the node
 */
void ds_chain_erase(const ds_chain_table * chain, ds_chain_node * node);

/**
 *  get node at index of the chain
 */
ds_chain_node * ds_chain_at(const ds_chain_table * chain, const ds_size index);

/**
 *  get first node has the same data value
 */
ds_chain_node * ds_chain_find(const ds_chain_table * chain, const ds_data data);

/**
 *  append data to the tail
 */
void ds_chain_append(ds_chain_table * chain,
                     const ds_data data, const ds_size data_size);

/**
 *  insert data after the node, if (node == NULL) then insert as head node
 */
void ds_chain_insert(ds_chain_table * chain, ds_chain_node * node,
                     const ds_data data, const ds_size data_size);

/**
 *  remove the chain node
 */
void ds_chain_remove(ds_chain_table * chain, ds_chain_node * node);

/**
 *  remove head item from the chain and return it,
 *  this node will no longer retain by the chain, so you should destroy it manually
 */
ds_chain_node * ds_chain_shift(ds_chain_table * chain);

/**
 *  destroy the node (this node must be removed from the chain already)
 */
void ds_chain_node_destroy(ds_chain_node * node);

/**
 *  sort the chain
 */
void ds_chain_sort(ds_chain_table * chain, const ds_size data_size);

/**
 *  insert data to the right position to keep the chain sorted
 */
void ds_chain_sort_insert(ds_chain_table * chain,
                          const ds_data data, const ds_size data_size);

/**
 *  reverse the chain
 */
void ds_chain_reverse(ds_chain_table * chain);

/**
 *  copy chain
 */
ds_chain_table * ds_chain_copy(const ds_chain_table * chain,
                               const ds_size data_size);

#endif /* defined(__ds_chain__) */
