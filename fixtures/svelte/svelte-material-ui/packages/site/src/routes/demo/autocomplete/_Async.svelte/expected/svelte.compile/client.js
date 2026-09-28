import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';
import { Text } from '@smui/list';
import CircularProgress from '@smui/circular-progress';

var root = $.from_html(`<div><!> <pre class="status"> </pre></div>`);

export default function _Async($$anchor, $$props) {
	$.push($$props, true);

	let fruits = [
		'Apple',
		'Orange',
		'Banana',
		'Mango',
		'Lemon',
		'Cherry',
		'Blueberry',
		'Grape',
		'Strawberry'
	];

	let value = $.state(void 0);
	let counter = 0;

	async function searchItems(input) {
		if (input === '') {
			return [];
		}

		if ($.get(value) != null) {
			// Return an array with just the already selected value to hide the menu.
			// As soon as the user changes the text field, the value is unselected, so
			// the search should run again.
			return [$.get(value)];
		}

		// Pretend to have some sort of canceling mechanism.
		const myCounter = ++counter;

		// Pretend to be loading something...
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// This means the function was called again, so we should cancel.
		if (myCounter !== counter) {
			// `return false` (or, more accurately, resolving the Promise object to
			// `false`) is how you tell Autocomplete to cancel this search. It won't
			// replace the results of any subsequent search that has already finished.
			return false;
		}

		// Return a list of matches.
		return fruits.filter((item) => item.toLowerCase().includes(input.toLowerCase()));
	}

	var div = root();
	var node = $.child(div);

	{
		const loading = ($$anchor) => {
			Text($$anchor, {
				style: 'display: flex; width: 100%; justify-content: center; align-items: center;',
				children: ($$anchor, $$slotProps) => {
					CircularProgress($$anchor, { style: 'height: 24px; width: 24px;', indeterminate: true });
				},
				$$slots: { default: true }
			});
		};

		Autocomplete(node, {
			search: searchItems,
			showMenuWithNoInput: false,
			label: 'Fruit',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			loading,
			$$slots: { loading: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Selected: ${($.get(value) || '') ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}