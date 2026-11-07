import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

export default function Output($$anchor, $$props) {
	{
		const msg = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		Component($$anchor, { msg, $$slots: { msg: true } });
	}
}