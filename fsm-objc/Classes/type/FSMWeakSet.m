// license: https://mit-license.org
//
//  FSM : Finite State Machine
//
//                               Written in 2023 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//
//  FSMWeakSet.m
//  FiniteStateMachine
//
//  Created by Albert Moky on 2023/3/6.
//  Copyright © 2023 DIM Group. All rights reserved.
//

#import "FSMWeakSet.h"

@interface FSMWeakReference () {
    
    /*__weak */id _target;
}

@end

@implementation FSMWeakReference

- (instancetype)init {
    NSAssert(false, @"don't call me!");
    id target = nil;
    return [self initWithTarget:target];
}

/* designated initializer */
- (instancetype)initWithTarget:(id)referent {
    if (self = [super init]) {
        _target = referent;
    }
    return self;
}

- (nullable id)target {
    return _target;
}

- (void)clear {
    _target = nil;
}

@end

#pragma mark -

@interface FSMWeakSet ()

@property(nonatomic, retain) NSMutableSet<FSMWeakReference<id> *> *innerSet;

@end

@implementation FSMWeakSet

- (void)dealloc {
    [_innerSet release];
    _innerSet = nil;
    
    [super dealloc];
}

/* designated initializer */
- (instancetype)init {
    if (self = [super init]) {
        _innerSet = [[NSMutableSet alloc] init];
    }
    return self;
}

/* designated initializer */
- (instancetype)initWithCapacity:(NSUInteger)numItems {
    if (self = [super init]) {
        _innerSet = [[NSMutableSet alloc] initWithCapacity:numItems];
    }
    return self;
}

- (NSUInteger)count {
    return [_innerSet count];
}

//- (NSUInteger)countByEnumeratingWithState:(NSFastEnumerationState *)state
//                                  objects:(id _Nullable[])buffer
//                                    count:(NSUInteger)len {
//    return [_innerSet countByEnumeratingWithState:state objects:buffer count:len];
//}

@end

static inline FSMWeakReference<id> *get_ref(NSMutableSet<FSMWeakReference<id> *> *set,
                                            id target) {
    __block FSMWeakReference<id> *found = nil;
    [set enumerateObjectsWithOptions:NSEnumerationConcurrent
                          usingBlock:^(FSMWeakReference<id> *ref, BOOL *stop) {
        if ([ref.target isEqual:target]) {
            found = ref;
            *stop = YES;
        }
    }];
    return found;
}

@implementation FSMWeakSet (NSExtendedSet)

- (NSArray<id> *)allObjects {
    NSMutableArray<id> *mArray = [[NSMutableArray alloc] init];
    [_innerSet enumerateObjectsWithOptions:NSEnumerationConcurrent
                                usingBlock:^(FSMWeakReference<id> *ref, BOOL *stop) {
        id obj = [ref target];
        if (obj) {
            [mArray addObject:obj];
        }
    }];
    return [mArray autorelease];
}

- (nullable id)anyObject {
    FSMWeakReference<id> *any = [_innerSet anyObject];
    return [any target];
}

- (BOOL)containsObject:(id)anObject {
    FSMWeakReference<id> *ref = get_ref(_innerSet, anObject);
    return ref != nil;
}

- (void)enumerateObjectsUsingBlock:(void (^)(id, BOOL *))block {
    [_innerSet enumerateObjectsUsingBlock:^(FSMWeakReference<id> *ref, BOOL *stop) {
        block(ref.target, stop);
    }];
}

- (void)enumerateObjectsWithOptions:(NSEnumerationOptions)opts
                         usingBlock:(void (^)(id, BOOL *))block {
    [_innerSet enumerateObjectsWithOptions:opts
                                usingBlock:^(FSMWeakReference<id> *ref, BOOL *stop) {
        block(ref.target, stop);
    }];
}

@end

@implementation FSMWeakSet (NSMutableSet)

- (void)addObject:(id)object {
    FSMWeakReference<id> *ref = [[FSMWeakReference alloc] initWithTarget:object];
    [_innerSet addObject:ref];
    [ref release];
}

- (void)removeObject:(id)object {
    FSMWeakReference<id> *ref = get_ref(_innerSet, object);
    if (ref) {
        [_innerSet removeObject:ref];
        [ref clear];
    }
}

@end

@implementation FSMWeakSet (NSExtendedMutableSet)

- (void)removeAllObjects {
    /*/
    [_innerSet enumerateObjectsWithOptions:NSEnumerationConcurrent
                                usingBlock:^(FSMWeakReference<id> *ref, BOOL *stop) {
        [ref clear];
    }];
    /*/
    [_innerSet removeAllObjects];
}

@end

@implementation FSMWeakSet (NSSetCreation)

+ (instancetype)set {
    FSMWeakSet *set = [[FSMWeakSet alloc] init];
    return [set autorelease];
}

@end

@implementation FSMWeakSet (NSMutableSetCreation)

+ (instancetype)setWithCapacity:(NSUInteger)numItems {
    FSMWeakSet *set = [[FSMWeakSet alloc] initWithCapacity:numItems];
    return [set autorelease];
}

@end
