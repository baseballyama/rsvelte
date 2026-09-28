import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(` <button>increment</button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let aborted = $.state(0);

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Child($$anchor, {
				get count() {
					return $.get(count);
				},

				get aborted() {
					return $.get(aborted);
				},

				set aborted($$value) {
					$.set(aborted, $$value, true);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(count) % 2 === 0) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `${$.get(aborted) ?? ''} `));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);