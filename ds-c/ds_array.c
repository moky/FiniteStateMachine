//
//  ds_array.c
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "ds_array.h"

static inline void _array_expand(ds_array * array)
{
    array->capacity *= 2;
    array->items = (ds_data *)realloc(array->items, array->capacity * array->item_size);
}

static inline void _array_assign(const ds_array * array,
                                 ds_data * dest, const ds_data src)
{
    if (array->fn.assign) {
        array->fn.assign(dest, src, array->item_size);
    } else if (array->bk.assign) {
        array->bk.assign(dest, src, array->item_size);
    } else {
        memcpy(dest, &src, array->item_size);
    }
}

static inline void _array_erase(const ds_array * array, ds_data * dest)
{
    if (array->fn.erase) {
        array->fn.erase(dest, array->item_size);
    } else if (array->bk.erase) {
        array->bk.erase(dest, array->item_size);
    } else {
        bzero(dest, array->item_size);
    }
}

//static inline void _array_erase_all(ds_array * array)
//{
//    if (array->count == 0) {
//        return;
//    }
//    ds_data * item;
//    ds_size index;
//    if (array->fn.erase) {
//        DS_ARRAY_FOR_EACH_ITEM(array, item, index) {
//            array->fn.erase(item);
//        }
//    } else if (array->bk.erase) {
//        DS_ARRAY_FOR_EACH_ITEM(array, item, index) {
//            array->bk.erase(item);
//        }
//    } else {
//        DS_ARRAY_FOR_EACH_ITEM(array, item, index) {
//            bzero(item, array->item_size);
//        }
//    }
//    array->count = 0;
//}

#pragma mark -

ds_array * ds_array_create(const ds_size item_size, const ds_size capacity)
{
    // 1. create a buffer for the array struct
    ds_array * array = (ds_array *)malloc(sizeof(ds_array));
    memset(array, 0, sizeof(ds_array));
    // set capacity & item size
    array->capacity = capacity > 0 ? capacity : 16;
    array->item_size = item_size > 0 ? item_size : sizeof(ds_data);
    // 2. create a contiguous buffer for data zone
    array->items = (ds_data *)calloc(array->capacity, array->item_size);
    return array;
}

void ds_array_destroy(ds_array * array)
{
    // 1. free data zone
    //_array_erase_all(array);
    free(array->items);
    array->items = NULL;
    
    // 2. free the array struct
    free(array);
}

ds_size ds_array_length(const ds_array * array)
{
    return array->count;
}

ds_bool ds_array_empty(const ds_array * array)
{
    return array->count == 0;
}

void ds_array_clear(ds_array * array)
{
    array->count = 0;
}

void ds_array_assign(ds_array * array, const ds_size index, const ds_data data)
{
    // 1. check capacity
    for (; index >= array->capacity;) {
        // out of memory
        _array_expand(array);
    }
    // 2. check data range
    if (index >= array->count) {
        // out of data zone
        array->count = index + 1;
    }
    // 3. set data
    ds_data * dest = ds_array_at(array, index);
    _array_assign(array, dest, data);
}

void ds_array_erase(ds_array * array, const ds_size index)
{
    ds_data * dest = ds_array_at(array, index);
    _array_erase(array, dest);
}

ds_data * ds_array_at(const ds_array * array, ds_size index)
{
    //assert(0 <= index && index < array->count);
    ds_byte * ptr = (ds_byte *)array->items;
    ptr += index * array->item_size;
    return (ds_data *)ptr;
}

ds_size ds_array_find(const ds_array * array, const ds_data data)
{
    ds_data item;
    ds_size index;
    if (array->fn.compare) {
        DS_ARRAY_FOR_EACH_ITEM(array, item, index) {
            if (array->fn.compare(item, data) == 0) {
                return index;
            }
        }
    } else if (array->bk.compare) {
        DS_ARRAY_FOR_EACH_ITEM(array, item, index) {
            if (array->bk.compare(item, data) == 0) {
                return index;
            }
        }
    } else {
        //S9Log(@"cannot search the array without comparing function");
    }
    return DSNotFound;
}

void ds_array_append(ds_array * array, const ds_data data)
{
    ds_array_assign(array, array->count, data);
}

void ds_array_insert(ds_array * array, const ds_size index, const ds_data data)
{
    //assert(index >= 0);
    if (index >= array->count) {
        // set data beyond current data zone
        ds_array_assign(array, index, data);
        return;
    }
    // 1. check capacity
    if (array->count >= array->capacity) {
        _array_expand(array);
    }
    // 2. move the rest data backwords from index
    ds_byte * src = (ds_byte *)array->items;
    src += index * array->item_size;
    ds_byte * dest = src + array->item_size;
    ds_size len = (array->count - index) * array->item_size;
    memmove(dest, src, len);

    // 3. set data at the position
    _array_assign(array, (ds_data *)src, data);
    array->count += 1;
}

void ds_array_remove(ds_array * array, ds_size index)
{
    //assert(0 <= index && index < array->count);
    index += 1;
    if (index < array->count) {
        // move subsequent elements forwards
        ds_byte * src = (ds_byte *)array->items;
        src += index * array->item_size;
        ds_byte *dest = src - array->item_size;
        ds_size len = (array->count - index) * array->item_size;
        memmove(dest, src, len);
    }
    array->count -= 1;
}

void ds_array_sort(ds_array * array)
{
    if (array->count <= 1) {
	    // no need to sort
	    return;
    }
    
    if (array->fn.compare && array->fn.assign)
    {
	    ds_qsort((ds_byte *)array->items,
                 0, array->count - 1,
	    	     array->fn.compare, array->item_size);
    }
    else if (array->bk.compare && array->bk.assign)
    {
	    ds_qsort_b((ds_byte *)array->items,
                   0, array->count - 1,
	    	       array->bk.compare, array->item_size);
    }
    else
    {
	    //S9Log(@"cannot sort without comparing function");
    }
}

void ds_array_sort_insert(ds_array * array, const ds_data item)
{
    ds_data data;
    ds_size index;
    
    // 1. seek for index
    if (array->fn.compare) {
	    DS_ARRAY_FOR_EACH_ITEM(array, data, index) {
    	    if (array->fn.compare(data, item) > 0) {
	    	    break; // got it
    	    }
	    }
    } else if (array->bk.compare) {
	    DS_ARRAY_FOR_EACH_ITEM(array, data, index) {
    	    if (array->bk.compare(data, item) > 0) {
	    	    break; // got it
    	    }
	    }
    } else {
	    //S9Log(@"cannot sort the array without comparing function");
	    index = array->count;
    }
    
    // 2. the item at index is bigger, insert here
    ds_array_insert(array, index, item);
}

ds_array * ds_array_copy(const ds_array * array)
{
    ds_array * new_array = ds_array_create(array->item_size, array->count);
    
    new_array->fn.assign  = array->fn.assign;
    new_array->fn.erase   = array->fn.erase;
    new_array->fn.compare = array->fn.compare;
    new_array->bk.assign  = array->bk.assign;
    new_array->bk.erase   = array->bk.erase;
    new_array->bk.compare = array->bk.compare;
    
    ds_data item;
    ds_size index;
    DS_ARRAY_FOR_EACH_ITEM(array, item, index) {
	    ds_array_append(new_array, item);
    }
    
    return new_array;
}
