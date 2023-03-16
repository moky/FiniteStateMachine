//
//  ds_base.h
//  DataStructure
//
//  Created by Moky on 15-8-24.
//  Copyright (c) 2015 Slanissue.com. All rights reserved.
//

#ifndef __ds_base__
#define __ds_base__

#include <stdlib.h>

typedef unsigned char ds_byte;
// base data type
typedef long ds_data;
// index/count/length
typedef int ds_size;

static const ds_size DSNotFound = -1;

static const int DSTrue  = 1;
static const int DSFalse = 0;

static const ds_data DSZero =  0;

enum _ds_comparison_result {
    DSAscending  = -1,  // left < right
    DSSame       =  0,  // left == right
    DSDescending =  1,  // left > right
};
typedef int ds_comparison_result;

//
//  functions
//
typedef void (*ds_assign_func)(const ds_data * dest, const ds_data src, const ds_size len);
typedef void (*ds_erase_func)(const ds_data * dest, const ds_size len);
typedef ds_comparison_result (*ds_compare_func)(const ds_data left, const ds_data right);

//
//  blocks
//
typedef void (^ds_assign_block)(const ds_data * dest, const ds_data src, const ds_size len);
typedef void (^ds_erase_block)(const ds_data * dest, const ds_size len);
typedef ds_comparison_result (^ds_compare_block)(const ds_data left, const ds_data right);


// templates
#define ds_assign_bt(T) ^void(const ds_data * dest,                            \
                              const ds_data src, const ds_size len) {          \
            T * ptr = (T *)dest;                                               \
            T val = (T)src;                                                    \
            *ptr = val;                                                        \
        }                                                                      \
                                                        /* EOF 'ds_assign_bt' */
#define ds_erase_bt(T) ^void(const ds_data * dest, const ds_size len) {        \
            T * ptr = (T *)dest;                                               \
            *ptr = DSZero;                                                     \
        }                                                                      \
                                                        /* EOF 'ds_assign_bt' */
#define ds_compare_bt(T) ^ds_comparison_result(const ds_data left,             \
                                               const ds_data right) {          \
            T v1 = (T)left;                                                    \
            T v2 = (T)right;                                                   \
            if (v1 < v2) {                                                     \
                return DSAscending;                                            \
            } else if (v1 > v2) {                                              \
                return DSDescending;                                           \
            } else {                                                           \
                return DSSame;                                                 \
            }                                                                  \
        }                                                                      \
                                                       /* EOF 'ds_compare_bt' */

// base data type
#define ds_assign_b         ds_assign_bt(ds_data)
#define ds_erase_b          ds_erase_bt(ds_data)
#define ds_compare_b        ds_compare_bt(ds_data)

// char
#define ds_assign_char_b    ds_assign_bt(char)
#define ds_erase_char_b     ds_erase_bt(char)
#define ds_compare_char_b   ds_compare_bt(char)
// unsigned char
#define ds_assign_uchar_b   ds_assign_bt(unsigned char)
#define ds_erase_uchar_b    ds_erase_bt(unsigned char)
#define ds_compare_uchar_b  ds_compare_bt(unsigned char)

// short
#define ds_assign_short_b   ds_assign_bt(short)
#define ds_erase_short_b    ds_erase_bt(short)
#define ds_compare_short_b  ds_compare_bt(short)
// unsigned short
#define ds_assign_ushort_b  ds_assign_bt(unsigned short)
#define ds_erase_ushort_b   ds_erase_bt(unsigned short)
#define ds_compare_ushort_b ds_compare_bt(unsigned short)

// int
#define ds_assign_int_b     ds_assign_bt(int)
#define ds_erase_int_b      ds_erase_bt(int)
#define ds_compare_int_b    ds_compare_bt(int)
// unsigned int
#define ds_assign_uint_b    ds_assign_bt(unsigned int)
#define ds_erase_uint_b     ds_erase_bt(unsigned int)
#define ds_compare_uint_b   ds_compare_bt(unsigned int)

// long
#define ds_assign_long_b    ds_assign_bt(long)
#define ds_erase_long_b     ds_erase_bt(long)
#define ds_compare_long_b   ds_compare_bt(long)
// unsigned long
#define ds_assign_ulong_b   ds_assign_bt(unsigned long)
#define ds_erase_ulong_b    ds_erase_bt(unsigned long)
#define ds_compare_ulong_b  ds_compare_bt(unsigned long)

// float
#define ds_assign_float_b   ds_assign_bt(float)
#define ds_erase_float_b    ds_erase_bt(float)
#define ds_compare_float_b  ds_compare_bt(float)

// double
#define ds_assign_double_b  ds_assign_bt(double)
#define ds_erase_double_b   ds_erase_bt(double)
#define ds_compare_double_b ds_compare_bt(double)


#pragma mark - Sort


// Quick Sort

void ds_qsort(ds_byte * array, const ds_size begin, const ds_size end,
    	      ds_compare_func compare, const ds_size item_size);

void ds_qsort_b(ds_byte * array, const ds_size begin, const ds_size end,
	    	    ds_compare_block compare, const ds_size item_size);

// Bubble Sort

void ds_bsort(ds_byte * array, const ds_size count,
    	      ds_compare_func compare, const ds_size item_size);

void ds_bsort_b(ds_byte * array, const ds_size count,
	    	    ds_compare_block compare, const ds_size item_size);

#endif /* defined(__ds_base__) */
