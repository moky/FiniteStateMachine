//
//  sm_protocol.h
//  FiniteStateMachine
//
//  Created by Moky on 14-12-12.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#ifndef __sm_protocol__
#define __sm_protocol__

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
 *      If current state changed, the delegate function "sm_machine_exit_state"
 *  will be called with the old state, after that, "sm_enter_state" will be
 *  called with the new state. This mechanism can let you do something in the
 *  two opportune moments.
 *
 */

#include "ds_array.h"
//#include "ds_chain.h"


#define SMNotFound      DSNotFound

#define SMTrue          DSTrue
#define SMFalse         DSFalse

typedef ds_bool         sm_bool;
typedef double          sm_time;  // seconds, from Jan 1, 1970 UTC


//
//  List
//
#define sm_array_list   1
#define sm_chain_list   2

#define sm_list_type    sm_array_list

#if   sm_list_type == sm_array_list
typedef ds_array        sm_list;
#elif sm_list_type == sm_chain_list
typedef ds_chain_table  sm_list;
#endif

typedef void *          sm_list_item;


typedef void            sm_context;


struct _sm_delegate;
struct _sm_state;
struct _sm_transition;
struct _sm_machine;


/**
 *  Ticker
 *
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 * @param elapsed - milliseconds from previous tick
 */
typedef void (*sm_tick)(struct _sm_machine *ctx, const sm_time now, const sm_time elapsed);


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
typedef void (*sm_enter_state) (const struct _sm_delegate *delegate,
                                const struct _sm_state    *next,
                                const         sm_context  *machine,
                                const         sm_time      now);

/**
 *  Called after old state exited
 *  (get current state from context)
 *
 * @param previous - old state
 * @param machine  - machine with context
 * @param now      - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void (*sm_exit_state)  (const struct _sm_delegate *delegate,
                                const struct _sm_state    *previous,
                                const         sm_context  *machine,
                                const         sm_time      now);

/**
 *  Called after current state paused
 *
 * @param current - current state
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void (*sm_pause_state) (const struct _sm_delegate *delegate,
                                const struct _sm_state    *current,
                                const         sm_context  *machine,
                                const         sm_time      now);

/**
 *  Called before current state resumed
 *
 * @param current - current state
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void (*sm_resume_state)(const struct _sm_delegate *delegate,
                                const struct _sm_state    *current,
                                const         sm_context  *machine,
                                const         sm_time      now);


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
typedef void     (*sm_state_enter) (const struct _sm_state   *state,
                                    const struct _sm_state   *previous,
                                    const         sm_context *machine,
                                    const         sm_time     now);

/**
 *  Called before old state exited
 *
 * @param next    - new state
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void     (*sm_state_exit)  (const struct _sm_state   *state,
                                    const struct _sm_state   *next,
                                    const         sm_context *machine,
                                    const         sm_time     now);

/**
 *  Called before current state paused
 *
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void     (*sm_state_pause) (const struct _sm_state   *state,
                                    const         sm_context *machine,
                                    const         sm_time     now);

/**
 *  Called after current state resumed
 *
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 */
typedef void     (*sm_state_resume)(const struct _sm_state   *state,
                                    const         sm_context *machine,
                                    const         sm_time     now);

/**
 *  Called by machine.tick() to evaluate each transitions
 *
 * @param machine - machine with context
 * @param now     - current time (milliseconds, from Jan 1, 1970 UTC)
 * @return success transition, or null to stay the current state
 */
typedef const struct _sm_transition *(*sm_state_evaluate)(const struct _sm_state   *state,
                                                          const         sm_context *machine,
                                                          const         sm_time     now);


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
typedef sm_bool (*sm_transition_evaluate)(const struct _sm_transition *trans,
                                          const         sm_context    *machine,
                                          const         sm_time        now);


//
//  =================
//    State machine
//  =================
//

/**
 *  Current state
 */
typedef struct _sm_state *(*sm_machine_current)(const struct _sm_machine *machine);

/**
 *  Change current state to 'default'
 */
typedef void (*sm_machine_start) (struct _sm_machine *machine, const sm_time now);

/**
 *  Change current state to null
 */
typedef void (*sm_machine_stop)  (struct _sm_machine *machine, const sm_time now);

/**
 *  Pause machine, current state not change
 */
typedef void (*sm_machine_pause) (struct _sm_machine *machine, const sm_time now);

/**
 *  Resume machine with current state
 */
typedef void (*sm_machine_resume)(struct _sm_machine *machine, const sm_time now);


//
//  ========================
//    Base Implementations
//  ========================
//

enum sm_status {
    sm_stopped = 0,
    sm_running = 1,
    sm_paused  = 2,
};

typedef struct _sm_delegate {
    // self
    sm_context *ctx;
    
    // methods
    sm_enter_state  enter_state;
    sm_exit_state   exit_state;
    sm_pause_state  pause_state;
    sm_resume_state resume_state;
    
} sm_delegate;

/**
 *  Base State
 */
typedef struct _sm_state {
    // self
    sm_context *ctx;
    
    // properties
    unsigned int index;  // state index in the machine
    
    sm_list *transitions;    // transitions of state
    
    // methods
    sm_state_enter    on_enter;
    sm_state_exit     on_exit;
    sm_state_pause    on_pause;
    sm_state_resume   on_resume;
    
    sm_state_evaluate evaluate;
    
} sm_state;

/**
 *  Base Transition
 */
typedef struct _sm_transition {
    // self
    sm_context *ctx;
    
    // property
    unsigned int target;  // target state index
    
    // method
    sm_transition_evaluate evaluate;
    
} sm_transition;

/**
 *  Base Machine
 */

typedef struct _sm_machine {
    // self
    sm_context *ctx;
    
    // properties
    sm_list *states;    // array of finite states
    int              current;   // current state index, -1 for null
    
    enum sm_status  status;    // machine status
    sm_delegate    *delegate;  // machine delegate
    
    // methods
    sm_machine_current current_state;
    
    sm_machine_start   start;
    sm_machine_stop    stop;
    sm_machine_pause   pause;
    sm_machine_resume  resume;
    
    sm_tick            tick;

} sm_machine;

#endif /* defined(__sm_protocol__) */
