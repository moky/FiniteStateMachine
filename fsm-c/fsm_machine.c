//
//  fsm_machine.c
//  FiniteStateMachine
//
//  Created by Moky on 14-12-12.
//  Copyright (c) 2014 Slanissue.com. All rights reserved.
//

#include <stdlib.h>
#include <string.h>

#include "fsm_chain_table.h"
#include "fsm_state.h"
#include "fsm_machine.h"

fsm_machine *fsm_create_machine(const char *default_state)
{
	fsm_machine * machime = (fsm_machine *)malloc(sizeof(fsm_machine));
	memset(machime, 0, sizeof(fsm_machine));
    if (default_state != NULL) {
        fsm_set_name(machime->default_state, default_state);
    }
    machime->states = fsm_chain_create();
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
	fsm_chain_destroy(machime->states);
//	machime->states = NULL;
    
//	machime->delegate = NULL;
//	machime->current_state = NULL;
//  machime->start = NULL;
//  machime->stop = NULL;
//  machime->pause = NULL;
//  machime->resume = NULL;
//  machime->change_state = NULL;
//	machime->ctx = NULL;
	
	// 2. free the machine
	free(machime);
}

void fsm_set_default_name(fsm_machine *machine, const char *default_state)
{
    if (default_state == NULL) {
        fsm_erase_name(machine->default_state);
    } else {
        fsm_set_name(machine->default_state, default_state);
    }
}

fsm_state *fsm_state_at(const fsm_machine *machine, unsigned int index)
{
    fsm_chain_node *node = fsm_chain_at(machine->states, index);
    return fsm_chain_get(node);
}

void fsm_add_state(fsm_machine *machine, const fsm_state *state)
{
	fsm_chain_add(machine->states, state);
}

fsm_state *fsm_get_state(const fsm_machine *machine, const char *name, unsigned int *index)
{
	fsm_state *state = NULL;
    if (index != NULL) {
        *index = FSMNotFound;
    }
	if (name != NULL) {
		const fsm_chain_node * node;
		unsigned int i = 0;
		DS_FOR_EACH_CHAIN_NODE(machine->states, node) {
			state = fsm_chain_get(node);
			if (strcmp(state->name, name) == 0) {
                if (index != NULL) {
                    *index = i;
                }
				break;
			}
			++i;
			state = NULL;
		}
	}
	return state;
}

fsm_state *fsm_get_default_state(const fsm_machine *machine, unsigned int *index)
{
    return fsm_get_state(machine, machine->default_state, index);
}

fsm_state *fsm_get_target_state(const fsm_machine *machine, const fsm_transition *trans, unsigned int *index)
{
    return fsm_get_state(machine, trans->target, index);
}

fsm_state *fsm_get_current_state(const fsm_machine *machine)
{
    return fsm_state_at(machine, machine->current);
}

fsm_bool fsm_change_state(fsm_machine *machine, const fsm_state *next,
                          const unsigned int index, const fsm_time now)
{
    if (index == machine->current) {
        // state not change
        return FSMFalse;
    }
    fsm_state *current = machine->current_state(machine);
    
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
    machine->current = index;
    
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
    unsigned int index = FSMNotFound;
    fsm_state *next = fsm_get_default_state(machine, &index);
    fsm_change_state(machine, next, index, now);
    machine->status = fsm_running;
}

void fsm_stop_machine(fsm_machine *machine, const fsm_time now)
{
    machine->status = fsm_stopped;
    // force current state to null
    fsm_change_state(machine, NULL, FSMNotFound, now);
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
            unsigned int index = FSMNotFound;
            fsm_state *next = fsm_get_target_state(machine, trans, &index);
            fsm_change_state(machine, next, index, now);
        }
    }
}
