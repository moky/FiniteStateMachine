//
//  ds_base.c
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#include <string.h>

#include "ds_base.h"

#define DS_ITEM(index)     (array + (index) * item_size)
#define DS_VALUE(item)     *((ds_data *)item)
#define DS_COPY(dest, src) memcpy((dest), (src), item_size)

// Quick Sort

void ds_qsort(ds_byte * array, const ds_size begin, const ds_size end,
    	      ds_compare_func compare, const ds_size item_size)
{
    ds_compare_block block = ^ds_comparison_result(const ds_data left,
                                                   const ds_data right) {
	    return compare(left, right);
    };
    ds_qsort_b(array, begin, end, block, item_size);
}

void ds_qsort_b(ds_byte * array, const ds_size begin, const ds_size end,
	    	    ds_compare_block compare, const ds_size item_size)
{
    ds_size left = begin;
    ds_size right = end;
    
    ds_data * key = (ds_data *)malloc(item_size);
    
    // 1. take the first item as key item
    DS_COPY(key, DS_ITEM(left));
    
    // 2. sort in range
    while (DSTrue) {
	    // seeking from right
	    while (left < right && compare(*key, DS_VALUE(DS_ITEM(right))) <= 0) {
    	    --right;
	    }
	    if (left >= right) {
    	    break; // finished
	    }
	    DS_COPY(DS_ITEM(left), DS_ITEM(right)); // move the smaller to left
	    
	    ++left; // already compared, skip it
	    
	    // seeking from left
	    while (left < right && compare(DS_VALUE(DS_ITEM(left)), *key) <= 0) {
    	    ++left;
	    }
	    if (left >= right) {
    	    break; // finished
	    }
	    DS_COPY(DS_ITEM(right), DS_ITEM(left)); // move the bigger to right
	    
	    --right; // already compared, skip it
    }
    
    // 3. put back the key item
    if (begin < left) {
	    DS_COPY(DS_ITEM(left), key);
    }
    
    // 4. sort left part
    if (begin + 1 < left) {
	    ds_qsort_b(array, begin, left - 1, compare, item_size);
    }
    // 5. sort right part
    if (left + 1 < end) {
	    ds_qsort_b(array, left + 1, end, compare, item_size);
    }
    
    free(key);
}

// Bubble Sort

void ds_bsort(ds_byte * array, const ds_size count,
    	      ds_compare_func compare, const ds_size item_size)
{
    ds_compare_block block = ^ds_comparison_result(const ds_data left,
                                                   const ds_data right) {
	    return compare(left, right);
    };
    ds_bsort_b(array, count, block, item_size);
}

void ds_bsort_b(ds_byte * array, const ds_size count,
	    	    ds_compare_block compare, const ds_size item_size)
{
    ds_size i, j;
    ds_byte *pi, *pj;
    
    ds_data * tmp = (ds_data *)malloc(item_size);
    
    for (i = 0, pi = array; i < count; ++i, pi += item_size) {
	    for (j = i + 1, pj = pi + item_size; j < count; ++j, pj += item_size) {
    	    if (compare(DS_VALUE(pi), DS_VALUE(pj)) > 0) {
	    	    // swap pi & pj
	    	    memcpy(tmp, pi, item_size);
	    	    memcpy(pi, pj, item_size);
	    	    memcpy(pj, tmp, item_size);
    	    }
	    }
    }
    
    free(tmp);
}
