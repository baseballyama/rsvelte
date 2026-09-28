import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Inspect } from '@components';

var root = $.from_html(`<div class="search-example svelte-ifv3rm"><!> <div class="not-content input-row svelte-ifv3rm"><label>Search mode <select><option>highlight</option><option>filter</option><option>filter-strict</option></select></label> <label>Highlight matches <input type="checkbox"/></label></div></div>`);

export default function Narrowing($$anchor, $$props) {
	$.push($$props, true);

	// import { onMount } from 'svelte'
	let ins = $.state(void 0);

	let search = $.state('highlight');
	let highlightMatches = $.state(true);

	const value = {
		id: undefined,
		firstName: 'Bob',
		lastName: 'Alice',
		email: 'bob@alice.lol',
		introduction: `The name is Alice.

    Bob Alice.`,
		birthDate: new Date(),
		website: new URL('https://alicebob.website/?ref=abcdefg#about'),
		age: -42,
		emailVerified: true,
		interests: ['radio', 'tv', 'internet', 'kayaks'],
		nilVals: [undefined, null, NaN, Infinity],
		get interestList() {
			return this.interests.join('\n');
		},

		doStuff() {
			if (this.emailVerified) {
				return this.email;
			} else {
				throw 'can not do stuff if email not verified';
			}
		}
	};

	onMount(() => {
		if ($.get(ins)) {
			$.get(ins).search('value:"radio" key:name type:bool');
		}
	});

	var div = root();
	var node = $.child(div);

	$.bind_this(
		Inspect(node, {
			get values() {
				return value;
			},
			expandLevel: 0,
			heading: 'Search Demo',
			searchMode: 'or',
			get search() {
				return $.get(search);
			},

			get highlightMatches() {
				return $.get(highlightMatches);
			},
			class: 'not-content',
			style: 'margin-top: 0 !important;'
		}),
		($$value) => $.set(ins, $$value, true),
		() => $.get(ins)
	);

	var div_1 = $.sibling(node, 2);
	var label = $.child(div_1);
	var select = $.sibling($.child(label));

	$.init_select(select);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input = $.sibling($.child(label_1));

	$.remove_input_defaults(input);
	$.reset(label_1);
	$.reset(div_1);
	$.reset(div);
	$.bind_select_value(select, () => $.get(search), ($$value) => $.set(search, $$value));
	$.bind_checked(input, () => $.get(highlightMatches), ($$value) => $.set(highlightMatches, $$value));
	$.append($$anchor, div);
	$.pop();
}