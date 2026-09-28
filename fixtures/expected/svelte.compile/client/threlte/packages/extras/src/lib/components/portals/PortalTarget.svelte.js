import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePortalContext } from './usePortalContext.svelte.js';

export default function PortalTarget($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, 'default');
	const portals = usePortalContext();
	const childrenArray = $.derived(() => portals.get(id()));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 16, () => $.get(childrenArray), (children) => children, ($$anchor, children) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => children);
				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(childrenArray) !== undefined) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}