//
//  fsm_protocol.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-12.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __fsm_protocol__
#define __fsm_protocol__

/**
 *
 *  Description:
 *
 *      Finite State Machine, which has finitely several states in it, only one
 *  of them will be set as the current state in the same time.
 *
 *      When the machine started up, we should build up all states and their own
 *  transitions for changing from self to another, adding all states with their
 *  transitions one by one into the machine.
 *
 *      In each time period, the function "tick" of machine will be called, this
 *  function will enumerate all transtions of the current state, try to evaluate
 *  each of them, while one transtion's function "evaluate" return YES, then
 *  the machine will change to the new state by the transtion's target name.
 *
 *      When the machine stopped, it will run out from the current state, and
 *  here we should remove all states.
 *
 *
 *      If current state changed, the delegate function "fsm_machine_exit_state"
 *  will be called with the old state, after that, "fsm_enter_state" will be
 *  called with the new state. This mechanism can let you do something in the
 *  two opportune moments.
 *
 */

#include "ds_array.h"
//#include "ds_chain.h"


#define FSMTrue             1
#define FSMFalse            0

#define FSMNotFound         0xffffffff


typedef int             fsm_bool;
typedef double          fsm_time;  // seconds, from Jan 1, 1970 UTC

//
//  List
//
#define fsm_list_array  1
#define fsm_list_chain  2

#define fsm_list_type   fsm_list_array

#if fsm_list_type == fsm_list_array
typedef ds_array        fsm_list;
#elif fsm_list_type == fsm_list_chain
typedef ds_chain_table  fsm_list;
#endif

typedef void *          fsm_list_item;


typedef void            fsm_context;


struct _fsm_delegate;
struct _fsm_state;
struct _fsm_transition;
struct _fsm_machine;


/**
 *  Ticker
 *
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 * @param elapsed - milliseconds from previous tick
 */
typedef void (*fsm_tick)(struct _fsm_machine *ctx, const fsm_time now, const fsm_time elapsed);


//
//  ==========================
//    State Machine Delegate
//  ==========================
//

/**
 *  Called before new state entered
 *  (get current state from context)
 *
 * @param next    - new state
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void (*fsm_enter_state) (const struct _fsm_delegate *delegate,
                                 const struct _fsm_state    *next,
                                 const         fsm_context  *machine,
                                 const         fsm_time      now);

/**
 *  Called after old state exited
 *  (get current state from context)
 *
 * @param previous - old state
 * @param machine  - machine with context
 * @param now      - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void (*fsm_exit_state)  (const struct _fsm_delegate *delegate,
                                 const struct _fsm_state    *previous,
                                 const         fsm_context  *machine,
                                 const         fsm_time      now);

/**
 *  Called after current state paused
 *
 * @param current - current state
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void (*fsm_pause_state) (const struct _fsm_delegate *delegate,
                                 const struct _fsm_state    *current,
                                 const         fsm_context  *machine,
                                 const         fsm_time      now);

/**
 *  Called before current state resumed
 *
 * @param current - current state
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void (*fsm_resume_state)(const struct _fsm_delegate *delegate,
                                 const struct _fsm_state    *current,
                                 const         fsm_context  *machine,
                                 const         fsm_time      now);


//
//  ================
//    Finite State
//  ================
//

/**
 *  Called after new state entered
 *
 * @param previous - old state
 * @param machine  - machine with context
 * @param now      - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void     (*fsm_state_enter) (const struct _fsm_state   *state,
                                     const struct _fsm_state   *previous,
                                     const         fsm_context *machine,
                                     const         fsm_time     now);

/**
 *  Called before old state exited
 *
 * @param next    - new state
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void     (*fsm_state_exit)  (const struct _fsm_state   *state,
                                     const struct _fsm_state   *next,
                                     const         fsm_context *machine,
                                     const         fsm_time     now);

/**
 *  Called before current state paused
 *
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void     (*fsm_state_pause) (const struct _fsm_state   *state,
                                     const         fsm_context *machine,
                                     const         fsm_time     now);

/**
 *  Called after current state resumed
 *
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void     (*fsm_state_resume)(const struct _fsm_state   *state,
                                     const         fsm_context *machine,
                                     const         fsm_time     now);

/**
 *  Called by machine.tick() to evaluate each transitions
 *
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 * @return success transition, or null to stay the current state
 */
typedef const struct _fsm_transition *(*fsm_state_evaluate)(const struct _fsm_state   *state,
                                                            const         fsm_context *machine,
                                                            const         fsm_time     now);


//
//  ====================
//    State Transition
//  ====================
//

/**
 *  Evaluate the current state
 *
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 * @return true when current state should be changed
 */
typedef fsm_bool (*fsm_transition_evaluate)(const struct _fsm_transition *trans,
                                            const         fsm_context    *machine,
                                            const         fsm_time        now);


//
//  =================
//    State machine
//  =================
//

/**
 *  Current state
 */
typedef struct _fsm_state *(*fsm_machine_current)(const struct _fsm_machine *machine);

/**
 *  Change current state to 'default'
 */
typedef void (*fsm_machine_start) (struct _fsm_machine *machine, const fsm_time now);

/**
 *  Change current state to null
 */
typedef void (*fsm_machine_stop)  (struct _fsm_machine *machine, const fsm_time now);

/**
 *  Pause machine, current state not change
 */
typedef void (*fsm_machine_pause) (struct _fsm_machine *machine, const fsm_time now);

/**
 *  Resume machine with current state
 */
typedef void (*fsm_machine_resume)(struct _fsm_machine *machine, const fsm_time now);


//
//  ========================
//    Base Implementations
//  ========================
//

enum fsm_status {
    fsm_stopped = 0,
    fsm_running = 1,
    fsm_paused  = 2,
};

typedef struct _fsm_delegate {
    // self
    fsm_context *ctx;
    
    // methods
    fsm_enter_state  enter_state;
    fsm_exit_state   exit_state;
    fsm_pause_state  pause_state;
    fsm_resume_state resume_state;
    
} fsm_delegate;

/**
 *  Base State
 */
typedef struct _fsm_state {
    // self
    fsm_context *ctx;
    
    // properties
    unsigned int index;  // state index in the machine
    
    fsm_list *transitions;    // transitions of state
    
    // methods
    fsm_state_enter    on_enter;
    fsm_state_exit     on_exit;
    fsm_state_pause    on_pause;
    fsm_state_resume   on_resume;
    
    fsm_state_evaluate evaluate;
    
} fsm_state;

/**
 *  Base Transition
 */
typedef struct _fsm_transition {
    // self
    fsm_context *ctx;
    
    // property
    unsigned int target;  // target state index
    
    // method
    fsm_transition_evaluate evaluate;
    
} fsm_transition;

/**
 *  Base Machine
 */

typedef struct _fsm_machine {
    // self
    fsm_context *ctx;
    
    // properties
    fsm_list *states;    // array of finite states
    int              current;   // current state index, -1 for null
    
    enum fsm_status  status;    // machine status
    fsm_delegate    *delegate;  // machine delegate
    
    // methods
    fsm_machine_current current_state;
    
    fsm_machine_start   start;
    fsm_machine_stop    stop;
    fsm_machine_pause   pause;
    fsm_machine_resume  resume;
    
    fsm_tick            tick;

} fsm_machine;

#endif /* defined(__fsm_protocol__) */
