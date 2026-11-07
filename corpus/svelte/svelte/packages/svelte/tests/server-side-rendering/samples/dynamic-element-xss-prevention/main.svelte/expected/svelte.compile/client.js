import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => $$props.tag, false, ($$element, $$anchor) => {
		var text = $.text('ok');

		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}