//
//  fsm_machine.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-12.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "fsm_list.h"
#include "fsm_state.h"
#include "fsm_machine.h"

fsm_machine *fsm_create_machine(unsigned int capacity)
{
    fsm_machine * machime = (fsm_machine *)malloc(sizeof(fsm_machine));
    memset(machime, 0, sizeof(fsm_machine));
    machime->states = fsm_list_create(capacity);
    machime->current = FSMNotFound;
    machime->status = fsm_stopped;
    // methods
    machime->current_state = fsm_get_current_state;
    machime->start         = fsm_start_machine;
    machime->stop          = fsm_stop_machine;
    machime->pause         = fsm_pause_machine;
    machime->resume        = fsm_resume_machine;
    machime->tick          = fsm_tick_machine;
    return machime;
}

void fsm_destroy_machine(fsm_machine *machime)
{
    // 1. destroy the chain table for states
    fsm_list_destroy(machime->states);
//    machime->states = NULL;
    
//    machime->delegate = NULL;
//    machime->current_state = NULL;
//  machime->start = NULL;
//  machime->stop = NULL;
//  machime->pause = NULL;
//  machime->resume = NULL;
//  machime->change_state = NULL;
//    machime->ctx = NULL;
    
    // 2. free the machine
    free(machime);
}

static inline fsm_state *fsm_state_at(const fsm_machine *machine, unsigned int index)
{
    return fsm_list_get(machine->states, index);
}

const fsm_state *fsm_add_state(fsm_machine *machine, const fsm_state *state)
{
    unsigned int index = state->index;
    fsm_state *old = fsm_list_get(machine->states, index);
    fsm_list_set(machine->states, index, (fsm_list_item)state);
    return old == state ? NULL : old;
}

fsm_state *fsm_get_state(const fsm_machine *machine, unsigned int index)
{
    return fsm_state_at(machine, index);
}

fsm_state *fsm_get_default_state(const fsm_machine *machine)
{
    return fsm_state_at(machine, 0);
}

fsm_state *fsm_get_target_state(const fsm_machine *machine, const fsm_transition *trans)
{
    return fsm_state_at(machine, trans->target);
}

fsm_state *fsm_get_current_state(const fsm_machine *machine)
{
    int current = machine->current;
    if (current < 0) {  // -1
        return NULL;
    }
    return fsm_state_at(machine, current);
}

static inline void fsm_set_current_state(fsm_machine *machine, const fsm_state *next)
{
    if (next == NULL) {
        machine->current = -1;
    } else {
        machine->current = next->index;
    }
}

/**
 *  Exit current state, and enter new state
 *
 * @param next - next state
 * @param now  - current time (milliseconds, from Jan 1, 1970 UTC)
 */
fsm_bool fsm_change_state(fsm_machine *machine, const fsm_state *next, const fsm_time now)
{
    fsm_state *current = fsm_get_current_state(machine);
    if (current == NULL) {
        if (next == NULL) {
            // state not change
            return FSMFalse;
        }
    } else if (current == next) {
        // state not change
        return FSMFalse;
    }
    
    fsm_context *ctx = machine;
    fsm_delegate *delegate = machine->delegate;
    
    //
    //  Events before state changed
    //
    if (delegate != NULL) {
        // prepare for changing current state to the new one,
        // the delegate can get old state via ctx if need
        delegate->enter_state(delegate, next, ctx, now);
    }
    if (current != NULL) {
        current->on_exit(current, next, ctx, now);
    }
    
    //
    //  Change current state
    //
    fsm_set_current_state(machine, next);
    
    //
    //  Events after state changed
    //
    if (next != NULL) {
        next->on_enter(next, current, ctx, now);
    }
    if (delegate != NULL) {
        // handle after the current state changed,
        // the delegate can get new state via ctx if need
        delegate->exit_state(delegate, current, ctx, now);
    }
    
    return FSMTrue;
}

void fsm_start_machine(fsm_machine *machine, const fsm_time now)
{
    fsm_state *next = fsm_get_default_state(machine);
    fsm_change_state(machine, next, now);
    machine->status = fsm_running;
}

void fsm_stop_machine(fsm_machine *machine, const fsm_time now)
{
    machine->status = fsm_stopped;
    // force current state to null
    fsm_change_state(machine, NULL, now);
}

void fsm_pause_machine(fsm_machine *machine, const fsm_time now)
{
    fsm_context *ctx = machine;
    fsm_delegate *delegate = machine->delegate;
    fsm_state *current = machine->current_state(machine);
    //
    //  Events before state paused
    //
    if (current != NULL) {
        current->on_pause(current, ctx, now);
    }
    //
    //  Pause current state
    //
    machine->status = fsm_paused;
    //
    //  Events after state paused
    //
    if (delegate != NULL) {
        delegate->pause_state(delegate, current, ctx, now);
    }
}

void fsm_resume_machine(fsm_machine *machine, const fsm_time now)
{
    fsm_context *ctx = machine;
    fsm_delegate *delegate = machine->delegate;
    fsm_state *current = machine->current_state(machine);
    //
    //  Events before state resumed
    //
    if (delegate != NULL) {
        delegate->resume_state(delegate, current, ctx, now);
    }
    //
    //  Pause current state
    //
    machine->status = fsm_running;
    //
    //  Events after state resumed
    //
    if (current != NULL) {
        current->on_resume(current, ctx, now);
    }
}

void fsm_tick_machine(fsm_machine *machine, const fsm_time now, const fsm_time elapsed)
{
    fsm_context *ctx = machine;
    fsm_state *current = machine->current_state(machine);
    if (current != NULL && machine->status == fsm_running) {
        const fsm_transition *trans = current->evaluate(current, ctx, now);
        if (trans != NULL) {
            fsm_state *next = fsm_get_target_state(machine, trans);
            fsm_change_state(machine, next, now);
        }
    }
}
