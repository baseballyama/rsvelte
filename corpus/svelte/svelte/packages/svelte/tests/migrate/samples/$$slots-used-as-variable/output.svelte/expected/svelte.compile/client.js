import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor, $$props) {
	let showMessage = $.prop($$props, 'showMessage', 19, () => $$props.message);
	let showTitle = $$props.title;
	let extraTitle = $.derived(() => $$props.extra);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.message ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (showMessage()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}