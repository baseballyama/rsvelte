import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const noStoreModule = "not a store";
var root = $.from_html(` <!> `, 1);

export default function Input($$anchor) {
	const $store = () => $.store_get(store, '$store', $$stores);
	const $noStoreModule = () => $.store_get(noStoreModule, '$noStoreModule', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = "not a store";

	$store();

	if ($store()) {}

	$noStoreModule();
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

	var text_1 = $.sibling(node);

	$.template_effect(() => {
		$.set_text(text, `${$store() ?? ''} `);
		$.set_text(text_1, ` ${$noStoreModule() ?? ''}`);
	});

	$.append($$anchor, fragment);
	$$cleanup();
}