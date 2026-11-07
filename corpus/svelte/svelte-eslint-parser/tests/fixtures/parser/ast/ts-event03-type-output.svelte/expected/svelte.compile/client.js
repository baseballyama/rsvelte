import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button></button> <input/>`, 1);

export default function Ts_event03_type_output($$anchor, $$props) {
	$.push($$props, true);

	// createEventDispatcher: <EventMap extends Record<string, any> = any>() => EventDispatcher<EventMap>, createEventDispatcher: <EventMap extends Record<string, any> = any>() => EventDispatcher<EventMap>
	const emit = createEventDispatcher();

	// emit: EventDispatcher<{ foo: number; bar: string; }>, createEventDispatcher<{ foo: number, bar: string }>(): EventDispatcher<{ foo: number; bar: string; }>
	emit('foo', 1); // emit('foo', 1): boolean

	var fragment = root();
	var button = $.first_child(fragment);

	var // e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }
	// e.currentTarget: EventTarget & HTMLButtonElement
	input = $.sibling(button, 2);

	$.event('click', button, (e) => {
		// e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }
		e.currentTarget; // e.currentTarget: EventTarget & HTMLButtonElement
	});

	$.event('input', input, (e) => {
		// e: Event & { currentTarget: EventTarget & HTMLInputElement; }
		e.currentTarget; // e.currentTarget: EventTarget & HTMLInputElement
	});

	$.append($$anchor, fragment);
	$.pop();
}