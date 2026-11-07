import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <!>`, 1);

export default function Rename5($$anchor) {
	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = null;

	$store();

	if ($store()) {}

	const foo = { $store: $store() };

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {};

		$.if(node, ($$render) => {
			if ($store()) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `${$store() ?? ''} `));
	$.append($$anchor, fragment);
	$$cleanup();
}