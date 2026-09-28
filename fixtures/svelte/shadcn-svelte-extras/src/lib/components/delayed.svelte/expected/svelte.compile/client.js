import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export default function Delayed($$anchor, $$props) {
	$.push($$props, true);

	let visible = $.state(false);

	onMount(() => {
		const timeout = setTimeout(
			() => {
				$.set(visible, true);
			},
			$$props.delay
		);

		return () => clearTimeout(timeout);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}