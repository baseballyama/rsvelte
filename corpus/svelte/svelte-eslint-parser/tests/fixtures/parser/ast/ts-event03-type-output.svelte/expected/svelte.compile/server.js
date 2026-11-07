import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Ts_event03_type_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// createEventDispatcher: <EventMap extends Record<string, any> = any>() => EventDispatcher<EventMap>, createEventDispatcher: <EventMap extends Record<string, any> = any>() => EventDispatcher<EventMap>
		const emit = createEventDispatcher();

		// emit: EventDispatcher<{ foo: number; bar: string; }>, createEventDispatcher<{ foo: number, bar: string }>(): EventDispatcher<{ foo: number; bar: string; }>
		emit('foo', 1); // emit('foo', 1): boolean

		$$renderer.push(`<button></button> <input/>`);
	});
}