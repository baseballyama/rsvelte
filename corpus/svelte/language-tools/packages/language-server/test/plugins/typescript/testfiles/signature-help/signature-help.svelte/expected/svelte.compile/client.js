import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { foo } from '../documentation';

export default function Signature_help($$anchor, $$props) {
	$.push($$props, true);
	foo();
	abc(1, '');

	/**
	 * @param b formatted number
	 */
	function abc(a, b) {}

	let items = [];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => items, $.index, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(item)));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
	$.pop();
}