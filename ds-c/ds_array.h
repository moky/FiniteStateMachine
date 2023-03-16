//
//  ds_array.h
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#ifndef __ds_array__
#define __ds_array__

#include "ds_base.h"

#define DS_ARRAY_FOR_EACH_ITEM(array, item, index)                             \
    for (ds_byte * __ptr = ((index) = 0, (ds_byte *)(array)->items);           \
         (item) = (__typeof__(item))__ptr, (index) < (array)->count;           \
         __ptr += (array)->item_size, ++(index))                               \
                                              /* EOF 'DS_ARRAY_FOR_EACH_ITEM' */

#define DS_ARRAY_FOR_EACH_ITEM_REVERSE(array, item, index)                     \
    for (ds_byte * __ptr = ((index) = (array)->count,                          \
                            (ds_byte *)((array)->items)                        \
                                  + ((index) - 1) * (array)->item_size);       \
         (item) = (__typeof__(item))__ptr, (index)-- > 0;                      \
         __ptr -= (array)->item_size)                                          \
                                      /* EOF 'DS_ARRAY_FOR_EACH_ITEM_REVERSE' */

typedef struct _ds_array {
    
    ds_size capacity; // max count of items
    ds_size count;
    
    ds_size item_size;
    ds_data * items;
    
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
} ds_array;

/**
 *  create an array
 */
ds_array * ds_array_create(const ds_size item_size, const ds_size capacity);

/**
 *  destroy an array
 */
void ds_array_destroy(ds_array * array);

/**
 *  get array->count
 */
ds_size ds_array_length(const ds_array * array);

/**
 *  check array->count == 0
 */
ds_bool ds_array_empty(const ds_array * array);

/**
 *  set array->count = 0
 */
void ds_array_clear(ds_array * array);

/**
 *  set data to the position of array (data should not be NULL)
 */
void ds_array_assign(ds_array * array, const ds_size index, const ds_data data);

/**
 *  erase data at the position of array
 */
void ds_array_erase(ds_array * array, const ds_size index);

/**
 *  get item at the position of the array
 */
ds_data * ds_array_at(const ds_array * array, const ds_size index);

/**
 *  get first position has the same data value
 */
ds_size ds_array_find(const ds_array * array, const ds_data data);

/**
 *  append data to the tail of the array
 */
void ds_array_append(ds_array * array, const ds_data data);

/**
 *  inserts data at the specified position in this array,
 *  shifts the element currently at that position and any subsequent elements to the right.
 */
void ds_array_insert(ds_array * array, const ds_size index, const ds_data data);

/**
 *  remove the item at index of the array,
 *  shifts any subsequent elements to the left.
 */
void ds_array_remove(ds_array * array, const ds_size index);

/**
 *  sort the array with compare function/block if given
 */
void ds_array_sort(ds_array * array);

/**
 *  insert the item at the right index of the array to keep it sorted
 */
void ds_array_sort_insert(ds_array * array, const ds_data item);

/**
 *  copy array, the new_array->capacity == old_array->count
 */
ds_array * ds_array_copy(const ds_array * array);

#endif /* defined(__ds_array__) */
