import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { getContext, onMount } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import promiseCode from './promises.txt?raw';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex col"><h3 id="promises">Promises</h3> <button>rerun</button> <!></div>`);

export default function Promises($$anchor, $$props) {
	$.push($$props, true);

	let promises = $.state(void 0);

	function run() {
		// promises = {}
		$.set(promises, {
			neverResolve: new Promise(() => {}),
			resolveInAFew: new Promise((resolve) => {
				setTimeout(
					() => {
						resolve('yep');
					},
					2000
				);
			}),

			rejectsInAFew: new Promise((_, reject) => {
				setTimeout(
					() => {
						reject('nope');
					},
					3500
				);
			})
		});
	}

	onMount(run);
	getContext('toc')?.set('Promises', 'promises');

	var div = root_1();
	var button = $.sibling($.child(div), 2);
	var node = $.sibling(button, 2);

	Stack(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Code(node_1, {
				style: 'flex-basis: 50%',
				get code() {
					return promiseCode;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.html(node_2, () => $$props.code);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					Inspect($$anchor, {
						get values() {
							return $.get(promises);
						}
					});
				};

				$.if(node_3, ($$render) => {
					if ($.get(promises)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.delegated('click', button, run);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);