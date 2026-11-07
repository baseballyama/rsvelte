import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Pane } from 'tweakpane';

var root = $.from_html(`<div></div> <pre> </pre>`, 1);

export default function VanillaTweakpaneRange($$anchor, $$props) {
	$.push($$props, true);

	let params = { speed: 50 };
	let container;

	onMount(() => {
		const pane = new Pane({ container });

		pane.addBinding(params, 'speed', { min: 0, max: 100 });

		pane.on('change', () => {
			// Trigger Svelte reactivity
			params = params;
		});

		return () => {
			pane.dispose();
		};
	});

	var fragment = root();
	var div = $.first_child(fragment);

	$.bind_this(div, ($$value) => container = $$value, () => container);

	var pre = $.sibling(div, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `${params.speed ?? ''}
`));

	$.append($$anchor, fragment);
	$.pop();
}