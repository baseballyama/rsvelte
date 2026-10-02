import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MultiCode from '$doclib/examples/MultiCode.svelte';
import { createPageTitle } from '$doclib/util.js';
import { Inspect, addComponent } from '$lib/index.js';
import CustomNumber from './CustomNumber.svelte';
import customNumberCode from './CustomNumber.txt?raw';
import ErrorOnHover from './ErrorOnHover.svelte';
import code from './example.txt?raw';
import ExpandableNumber from './ExpandableNumber.svelte';
import HexString from './HexString.svelte';
import customStringCode from './HexString.txt?raw';

var root = $.from_html(
	`<h2>Custom Components <sup>beta</sup></h2> <p><code>svelte-inspect-value</code> aims to (eventually) export all the building blocks to extend the
  component with custom components.</p> <p>Better documentation soon! Here's a minimal example:</p> <h3>Custom line</h3>  <!> Result <!> <label class="flex row align-center">show string for custom string component <input type="checkbox"/></label> <h3>Custom expandable</h3> *Custom expandables API is still unfinished <!> <h2>Error handling</h2> <p>If any component, built-in or custom, should throw an error it will be caught by a boundary on an
  entry-per-entry basis and render error details.<br/> The error value display component reverts to using default components to avoid further issues.</p> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const anObject = {
		oneBillion: 1000000000,
		oneTwoThreeFourEtc: 1234567890,
		maxSafe: Number.MAX_SAFE_INTEGER,
		red: '#FF0000',
		pink: '#FF00FF',
		yella: '#FFFF00',
		notAColor: 'hello'
	};

	let showString = $.state(false);

	const customComponents = $.derived(() => ({
		number: [CustomNumber],
		string: addComponent(HexString, (props) => ({ showString: $.get(showString), value: props.value }), (props) => props.value.startsWith('#'))
	}));

	var fragment = root();

	$.head('mx51e9', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Custom Components')]
		);
	});

	var node = $.sibling($.first_child(fragment), 8);

	{
		let $0 = $.derived(() => [
			{ code, label: '+page.svelte', language: 'svelte' },
			{
				code: customNumberCode,
				label: 'GoofyNumber.svelte',
				language: 'svelte'
			},

			{
				code: customStringCode,
				label: 'HexString.svelte',
				language: 'svelte'
			}
		]);

		MultiCode(node, {
			get examples() {
				return $.get($0);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	Inspect(node_1, {
		get value() {
			return anObject;
		},

		get customComponents() {
			return $.get(customComponents);
		},
		name: 'numbersAndColors'
	});

	var label = $.sibling(node_1, 2);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var node_2 = $.sibling(label, 4);

	{
		let $0 = $.derived(() => ({ number: [ExpandableNumber] }));

		Inspect(node_2, {
			value: 2,
			get customComponents() {
				return $.get($0);
			}
		});
	}

	var node_3 = $.sibling(node_2, 6);

	{
		let $0 = $.derived(() => ({ string: [ErrorOnHover] }));

		Inspect(node_3, {
			value: {
				'clickToError👉': 'click me',
				hey: 'dont click me i will error'
			},
			name: 'customString',
			get customComponents() {
				return $.get($0);
			}
		});
	}

	$.bind_checked(input, () => $.get(showString), ($$value) => $.set(showString, $$value));
	$.append($$anchor, fragment);
	$.pop();
}