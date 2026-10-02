import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<!> <button>Del</button>`, 1);

export default function Main($$anchor) {
	let state = { title: 'foo' };
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const attributes = $.derived(() => ({ title: state.title }));

			Component($$anchor, $.spread_props(() => $.get(attributes)));
		};

		$.if(node, ($$render) => {
			if (state) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		state = undefined;
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);