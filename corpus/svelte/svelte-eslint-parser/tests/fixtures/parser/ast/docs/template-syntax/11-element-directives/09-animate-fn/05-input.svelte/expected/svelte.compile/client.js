import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';

var root = $.from_html(`<div> </div>`);

export default function _5_input($$anchor) {
	function whizz(node, { from, to }, params) {
		const dx = from.left - to.left;
		const dy = from.top - to.top;
		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			tick: (t, u) => Object.assign(node.style, { color: t > 0.5 ? 'Pink' : 'Blue' })
		};
	}

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.each(node_1, 26, () => list, (item) => item, ($$anchor, item) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, item));
		$.animation(div, () => whizz, null);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}