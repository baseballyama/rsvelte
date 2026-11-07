import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scrollPos } from './scrollPos';

export default function Trigger($$anchor, $$props) {
	const $scrollPos = () => $.store_get(scrollPos, '$scrollPos', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.snippet(node_2, () => $$props.fallback ?? $.noop);
			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (($$props.in === undefined || $scrollPos() > $$props.in) && ($$props.out === undefined || $scrollPos() < $$props.out)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$$cleanup();
}