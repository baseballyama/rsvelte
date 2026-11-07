import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '@smui/textfield';
import Paper from '@smui/paper';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="solo-demo-container solo-container svelte-gwyy1o"><!> <!></div> <pre class="status svelte-gwyy1o"> </pre>`, 1);

export default function _Solo($$anchor) {
	let value = $.state('');

	function doSearch() {
		alert('Search for ' + $.get(value));
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter') {
			doSearch();
		}
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Paper(node, {
		class: 'solo-paper',
		elevation: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Icon(node_1, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('search');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Input(node_2, {
				onkeydown: handleKeyDown,
				placeholder: 'Search',
				class: 'solo-input',
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(value) === '');

		Fab(node_3, {
			onclick: doSearch,
			get disabled() {
				return $.get($0);
			},
			color: 'primary',
			mini: true,
			class: 'solo-fab',
			children: ($$anchor, $$slotProps) => {
				Icon($$anchor, {
					class: 'material-icons',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('arrow_forward');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_2, `Value: ${$.get(value) ?? ''}`));
	$.append($$anchor, fragment);
}