//
//  ds_chain.c
//  SlanissueToolkit
//
//  Created by Moky on 15-8-25.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "ds_chain.h"

static inline ds_chain_node * _create_node(const ds_size data_size)
{
    //assert(data_size > 0);
    
    // 1. create a buffer for the whole struct and data memory
    ds_size len = sizeof(ds_chain_node) + data_size;
    ds_byte * ptr = malloc(len);
    memset(ptr, 0, len);
    
    // 2. allocate memories
    //    the first part (size = sizeof(ds_chain_node)) to store the node struct
    //    the rest part (size = chain->data_size) to store the data
    ds_chain_node * node = (ds_chain_node *)ptr;
    node->data = (ds_data *)(ptr + sizeof(ds_chain_node));
    node->data_size = data_size;
    
    return node;
}

static inline void _destroy_node(ds_chain_node * node)
{
    // the node->data points to the memory after this node,
    // it will be free at the same time
    free(node);
}

#pragma mark -

ds_chain_table * ds_chain_create(void)
{
    // create a buffer for the chain struct
    ds_chain_table * chain = (ds_chain_table *)malloc(sizeof(ds_chain_table));
    memset(chain, 0, sizeof(ds_chain_table));
    return chain;
}

void ds_chain_destroy(ds_chain_table * chain)
{
    // 1. free child nodes
    for (ds_chain_node * next; chain->head; chain->head = next) {
        next = chain->head->next;
        _destroy_node(chain->head);
    }
    // chain->head is NULL already, now clear chain->tail
    chain->tail = NULL;
    
    // 2. free the chain
    free(chain);
}

ds_size ds_chain_length(const ds_chain_table * chain)
{
    ds_size len = 0;
    ds_chain_node * node = chain->head;
    for (; node; node = node->next) {
        ++len;
    }
    return len;
}

void ds_chain_assign(const ds_chain_table * chain,
                     ds_chain_node * node,
                     const ds_data data, const ds_size data_size)
{
    if (chain->fn.assign) {
        chain->fn.assign(node->data, data, data_size);
    } else if (chain->bk.assign) {
        chain->bk.assign(node->data, data, data_size);
    } else {
        memcpy(node->data, &data, data_size);
    }
}

void ds_chain_erase(const ds_chain_table * chain, ds_chain_node * node)
{
    if (chain->fn.erase) {
        chain->fn.erase(node->data, node->data_size);
    } else if (chain->bk.erase) {
        chain->bk.erase(node->data, node->data_size);
    } else {
        bzero(node->data, node->data_size);
    }
}

ds_chain_node * ds_chain_at(const ds_chain_table * chain, ds_size index)
{
    ds_chain_node * node;
    DS_FOR_EACH_CHAIN_NODE(chain, node) {
	    if (index == 0) {
    	    break;
	    }
	    --index;
    }
    return node;
}

ds_chain_node * ds_chain_find(const ds_chain_table * chain, const ds_data data)
{
    ds_chain_node * node;
    if (chain->fn.compare) {
	    DS_FOR_EACH_CHAIN_NODE(chain, node) {
    	    if (chain->fn.compare(*(node->data), data) == 0) {
	    	    return node;
    	    }
	    }
    } else if (chain->bk.compare) {
	    DS_FOR_EACH_CHAIN_NODE(chain, node) {
    	    if (chain->bk.compare(*(node->data), data) == 0) {
	    	    return node;
    	    }
	    }
    } else {
	    //S9Log(@"cannot search the chain without comparing function");
    }
    return NULL;
}

void ds_chain_append(ds_chain_table * chain,
                     const ds_data data, const ds_size data_size)
{
    ds_chain_insert(chain, chain->tail, data, data_size);
}

void ds_chain_insert(ds_chain_table * chain, ds_chain_node * node,
                     const ds_data data, const ds_size data_size)
{
    // 1. create new node and assign value
    ds_chain_node * guest = _create_node(data_size);
    if (data) {
        ds_chain_assign(chain, guest, data, data_size);
    }

    // 2. insert
    if (node) {
        // after the node
        guest->next = node->next;
        node->next = guest;
    } else {
        // as head node
        guest->next = chain->head;
        chain->head = guest;
    }
    
    // 3. check tail
    if (node == chain->tail) {
        chain->tail = guest;
    }
}

void ds_chain_remove(ds_chain_table * chain, ds_chain_node * node)
{
    if (node == chain->head) {
        chain->head = node->next;
    } else {
        ds_chain_node * prev;
        DS_FOR_EACH_CHAIN_NODE(chain, prev) {
            if (prev->next == node) {
                // got it
                break;
            }
        }
        //assert(prev, "node not found");
        prev->next = node->next;
        // check tail
        if (node == chain->tail) {
            chain->tail = prev;
        }
    }
    _destroy_node(node);
}

#define DS_VALUE(item)     *(item)

#define DS_SWAP(x, y)                                                          \
        do {                                                                   \
            memcpy(tmp, (x), data_size);                                \
            memcpy((x), (y), data_size);                                \
            memcpy((y), tmp, data_size);                                \
        } while(0)

void ds_chain_sort(ds_chain_table * chain, const ds_size data_size)
{
    if (chain->head == NULL || chain->head->next == NULL) {
	    // 1. the chain is empty
	    // 2. the chain has only one node
	    return;
    }
    
    //
    //  Bubble Sort
    //
    ds_chain_node * pi = chain->head;
    ds_chain_node * pj;
    
    ds_data * tmp = (ds_data *)malloc(data_size);
    
    if (chain->fn.compare) {
	    for (; pi; pi = pi->next) {
    	    pj = pi->next;
    	    for (; pj; pj = pj->next) {
	    	    if (chain->fn.compare(DS_VALUE(pi->data),
                                      DS_VALUE(pj->data)) > 0) {
    	    	    DS_SWAP(pi->data, pj->data);
	    	    }
    	    }
	    }
    } else if (chain->bk.compare) {
	    for (; pi; pi = pi->next) {
    	    pj = pi->next;
    	    for (; pj; pj = pj->next) {
	    	    if (chain->bk.compare(DS_VALUE(pi->data),
                                      DS_VALUE(pj->data)) > 0) {
    	    	    DS_SWAP(pi->data, pj->data);
	    	    }
    	    }
	    }
    } else {
	    //S9Log(@"cannot sort the chain without comparing function");
    }
    
    free(tmp);
}

void ds_chain_sort_insert(ds_chain_table * chain,
                          const ds_data data, const ds_size data_size)
{
    // 1. seek
    ds_chain_node * node;
    if (chain->fn.compare) {
	    DS_FOR_EACH_CHAIN_NODE(chain, node) {
    	    if (node->next && chain->fn.compare(DS_VALUE(node->next->data),
                                                data) > 0) {
	    	    break;
    	    }
	    }
    } else if (chain->bk.compare) {
	    DS_FOR_EACH_CHAIN_NODE(chain, node) {
    	    if (node->next && chain->bk.compare(DS_VALUE(node->next->data),
                                                data) > 0) {
	    	    break;
    	    }
	    }
    } else {
	    //S9Log(@"cannot sort the chain without comparing function");
	    node = chain->tail;
    }
    // 2. insert
    ds_chain_insert(chain, node, data, data_size);
}

void ds_chain_reverse(ds_chain_table * chain)
{
    if (chain->head == NULL || chain->head->next == NULL) {
	    // 1. the chain is empty
	    // 2. the chain has only one node
	    return;
    }
    ds_chain_node * prev = NULL;
    ds_chain_node * node = chain->head;
    ds_chain_node * next;
    
    for (; node; prev = node, node = next) {
	    next = node->next;
	    node->next = prev;
    }
    
    // swap head & tail
    node = chain->tail;
    chain->tail = chain->head;
    chain->head = node;
}

ds_chain_table * ds_chain_copy(const ds_chain_table * chain,
                               const ds_size data_size)
{
    ds_chain_table * new_chain = ds_chain_create();
    
    new_chain->fn.assign  = chain->fn.assign;
    new_chain->fn.erase   = chain->fn.erase;
    new_chain->fn.compare = chain->fn.compare;
    new_chain->bk.assign  = chain->bk.assign;
    new_chain->bk.erase   = chain->bk.erase;
    new_chain->bk.compare = chain->bk.compare;
    
    ds_chain_node * node;
    DS_FOR_EACH_CHAIN_NODE(chain, node) {
	    // insert data after the new chain's tail
        ds_chain_append(new_chain, DS_VALUE(node->data), data_size);
    }
    
    return new_chain;
}
