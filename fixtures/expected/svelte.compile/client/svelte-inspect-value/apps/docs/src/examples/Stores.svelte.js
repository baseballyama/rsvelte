import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '@components';
import { onMount } from 'svelte';
import { readable, writable } from 'svelte/store';
import { fromEvent, map, startWith } from 'rxjs';

var root = $.from_html(`<!> <div class="input-row"><label>stores mode <select><option>off (false)</option><option>full</option><option>value-only</option></select></label></div>`, 1);

export default function Stores($$anchor, $$props) {
	$.push($$props, true);

	let storesMode = $.state('full');
	let clicksObservable = $.state(void 0);

	function customStore(initialValue = 0) {
		let interval;

		let val = writable(initialValue, () => {
			interval = window.setInterval(
				() => {
					val.update((n) => n + 1);
				},
				500
			);

			return () => {
				window.clearInterval(interval);
			};
		});

		return {
			...val,
			set value(v) {
				val.set(v);
			}
		};
	}

	onMount(() => {
		$.set(clicksObservable, fromEvent(document.body, 'click').pipe(startWith(`0 clicks`), map((_, i) => `${i} clicks`)), true);
	});

	const stores = $.derived(() => ({
		writableStore: writable('i am the store value'),
		test: writable('i am the\n store value'),
		readableStore: readable({ a: { b: { c: { d: { e: 'end' } } } } }),
		customStore: customStore(0),
		fakeStore: { subscribe: () => 'hi' }
	}));

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ ...$.get(stores), clicksObservable: $.get(clicksObservable) }));

		Inspect(node, {
			class: 'not-content mt',
			get values() {
				return $.get($0);
			},
			expandLevel: 0,
			get stores() {
				return $.get(storesMode);
			}
		});
	}

	var div = $.sibling(node, 2);
	var label = $.child(div);
	var select = $.sibling($.child(label));
	var option = $.child(select);

	option.value = option.__value = false;
	$.next(2);
	$.reset(select);
	$.init_select(select);
	$.reset(label);
	$.reset(div);
	$.bind_select_value(select, () => $.get(storesMode), ($$value) => $.set(storesMode, $$value));
	$.append($$anchor, fragment);
	$.pop();
}