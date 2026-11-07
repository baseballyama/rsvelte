import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '@components';
import { onMount } from 'svelte';

var root = $.from_html(`<button>rerun</button>`);

export default function Promises($$anchor, $$props) {
	$.push($$props, true);

	let promises = $.state(void 0);

	function run(e) {
		if (e) e.stopPropagation();

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				const heading = ($$anchor) => {
					var button = root();

					$.delegated('click', button, run);
					$.append($$anchor, button);
				};

				Inspect($$anchor, {
					get values() {
						return $.get(promises);
					},
					heading,
					$$slots: { heading: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(promises)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);