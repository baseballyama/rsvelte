import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { blubb } from './definitions';
import ImportedFile from './imported-file.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Definitions($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $blubb = () => $.store_get(blubb, '$blubb', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function bla() {
		return true;
	}

	bla();
	blubb();

	let store = null;

	$store();

	if ($store()) {}

	$blubb();

	if ($blubb()) {}

	var fragment = root();
	var node = $.first_child(fragment);

	ImportedFile(node, {});

	var text = $.sibling(node);
	var node_1 = $.sibling(text);

	{
		var consequent = ($$anchor) => {};

		$.if(node_1, ($$render) => {
			if ($store()) $$render(consequent);
		});
	}

	var text_1 = $.sibling(node_1);
	var node_2 = $.sibling(text_1);

	{
		var consequent_1 = ($$anchor) => {};

		$.if(node_2, ($$render) => {
			if ($blubb()) $$render(consequent_1);
		});
	}

	$.template_effect(() => {
		$.set_text(text, ` ${$store() ?? ''} `);
		$.set_text(text_1, ` ${$blubb() ?? ''} `);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}