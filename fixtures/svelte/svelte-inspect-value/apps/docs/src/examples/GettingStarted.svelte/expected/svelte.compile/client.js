import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect, Panel } from '@components';
import _Inspect from 'svelte-inspect-value';

var root = $.from_html(`<div id="getting-started" class="not-content svelte-1vj4tnr"><code id="panel-hint" class="svelte-1vj4tnr">Inspect.Panel 👉</code> <code class="svelte-1vj4tnr">Inspect</code> <!> <code class="svelte-1vj4tnr">Inspect.Values</code> <!> <!></div>`);

export default function GettingStarted($$anchor, $$props) {
	$.push($$props, true);

	let value = $.proxy({
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
		interests: ['radio', 'tv', 'internet', 'kayaks']
	});

	const InspectValues = _Inspect.Values.withOptions(() => ({
		elementAttributes: { style: 'width: 400px;', class: 'mt not-content' },
		expandLevel: 0
	}));

	var div = root();
	var node = $.sibling($.child(div), 4);

	Inspect(node, {
		get value() {
			return value;
		},
		style: 'max-width: 400px'
	});

	var node_1 = $.sibling(node, 4);

	InspectValues(node_1, $.spread_props(() => value));

	var node_2 = $.sibling(node_1, 2);

	Panel(node_2, {
		expandLevel: 0,
		get values() {
			return value;
		},
		style: 'position:absolute'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}