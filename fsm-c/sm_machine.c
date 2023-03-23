//
//  sm_machine.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-12.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "sm_list.h"
#include "sm_state.h"
#include "sm_machine.h"

sm_machine *sm_create_machine(unsigned int capacity)
{
    sm_machine * machime = (sm_machine *)malloc(sizeof(sm_machine));
    memset(machime, 0, sizeof(sm_machine));
    machime->states = sm_list_create(capacity);
    machime->current = SMNotFound;
    machime->status = sm_stopped;
    // methods
    machime->current_state = sm_get_current_state;
    machime->start         = sm_start_machine;
    machime->stop          = sm_stop_machine;
    machime->pause         = sm_pause_machine;
    machime->resume        = sm_resume_machine;
    machime->tick          = sm_tick_machine;
    return machime;
}

void sm_destroy_machine(sm_machine *machime)
{
    // 1. destroy the chain table for states
    sm_list_destroy(machime->states);
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

static inline sm_state *sm_state_at(const sm_machine *machine, unsigned int index)
{
    return sm_list_get(machine->states, index);
}

const sm_state *sm_add_state(sm_machine *machine, const sm_state *state)
{
    unsigned int index = state->index;
    sm_state *old = sm_list_get(machine->states, index);
    sm_list_set(machine->states, index, (sm_list_item)state);
    return old == state ? NULL : old;
}

sm_state *sm_get_state(const sm_machine *machine, unsigned int index)
{
    return sm_state_at(machine, index);
}

sm_state *sm_get_default_state(const sm_machine *machine)
{
    return sm_state_at(machine, 0);
}

sm_state *sm_get_target_state(const sm_machine *machine, const sm_transition *trans)
{
    return sm_state_at(machine, trans->target);
}

sm_state *sm_get_current_state(const sm_machine *machine)
{
    int current = machine->current;
    if (current < 0) {  // -1
        return NULL;
    }
    return sm_state_at(machine, current);
}

static inline void sm_set_current_state(sm_machine *machine, const sm_state *next)
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
sm_bool sm_change_state(sm_machine *machine, const sm_state *next, const sm_time now)
{
    sm_state *current = sm_get_current_state(machine);
    if (current == NULL) {
        if (next == NULL) {
            // state not change
            return SMFalse;
        }
    } else if (current == next) {
        // state not change
        return SMFalse;
    }
    
    sm_context *ctx = machine;
    sm_delegate *delegate = machine->delegate;
    
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
    sm_set_current_state(machine, next);
    
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
    
    return SMTrue;
}

void sm_start_machine(sm_machine *machine, const sm_time now)
{
    sm_state *next = sm_get_default_state(machine);
    sm_change_state(machine, next, now);
    machine->status = sm_running;
}

void sm_stop_machine(sm_machine *machine, const sm_time now)
{
    machine->status = sm_stopped;
    // force current state to null
    sm_change_state(machine, NULL, now);
}

void sm_pause_machine(sm_machine *machine, const sm_time now)
{
    sm_context *ctx = machine;
    sm_delegate *delegate = machine->delegate;
    sm_state *current = machine->current_state(machine);
    //
    //  Events before state paused
    //
    if (current != NULL) {
        current->on_pause(current, ctx, now);
    }
    //
    //  Pause current state
    //
    machine->status = sm_paused;
    //
    //  Events after state paused
    //
    if (delegate != NULL) {
        delegate->pause_state(delegate, current, ctx, now);
    }
}

void sm_resume_machine(sm_machine *machine, const sm_time now)
{
    sm_context *ctx = machine;
    sm_delegate *delegate = machine->delegate;
    sm_state *current = machine->current_state(machine);
    //
    //  Events before state resumed
    //
    if (delegate != NULL) {
        delegate->resume_state(delegate, current, ctx, now);
    }
    //
    //  Pause current state
    //
    machine->status = sm_running;
    //
    //  Events after state resumed
    //
    if (current != NULL) {
        current->on_resume(current, ctx, now);
    }
}

void sm_tick_machine(sm_machine *machine, const sm_time now, const sm_time elapsed)
{
    sm_context *ctx = machine;
    sm_state *current = machine->current_state(machine);
    if (current != NULL && machine->status == sm_running) {
        const sm_transition *trans = current->evaluate(current, ctx, now);
        if (trans != NULL) {
            sm_state *next = sm_get_target_state(machine, trans);
            sm_change_state(machine, next, now);
        }
    }
}
