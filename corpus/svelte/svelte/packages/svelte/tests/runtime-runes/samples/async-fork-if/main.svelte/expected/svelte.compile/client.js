import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';
import Child from './Child.svelte';

var root = $.from_html(`<button>fork</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let x = $.state('world');
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Child($$anchor, {
				get x() {
					return $.get(x);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(x) === 'universe') $$render(consequent);
		});
	}

	$.delegated('click', button, async () => {
		const f = fork(() => {
			$.set(x, 'universe');
		});

		await new Promise((r) => setTimeout(r));
		f.commit();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);