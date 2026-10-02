import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let anyType;

	async function load() {
		anyType = await (await fetch('')).json();
	}

	load();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => anyType, $.index, ($$anchor, anyEntry) => {
		$.next();

		var text = $.text();

		$.template_effect(($0) => $.set_text(text, $0), [() => $.get(anyEntry).asd()]);
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
	$.pop();
}