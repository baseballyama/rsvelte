import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { showACLPagesStore } from '$lib/common/stores';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div><h2 class="text-xl bold text-secondary mb-2 ml-2">ACL Pages <input type="checkbox" class="toggle toggle-sm ml-2 align-middle"/></h2></div>`);
var root_1 = $.from_html(`<div class="inline-block"><h1 class="text-2xl bold text-primary mb-4">Developer Flags<input type="checkbox" class="toggle toggle-sm tooltip ml-2 align-middle" data-tip="To enable development features. Only check this if you're a developer or like being confused"/></h1></div> <!>`, 1);

export default function DevSettings($$anchor) {
	const $showACLPagesStore = () => $.store_get(showACLPagesStore, '$showACLPagesStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDevSettings = false;
	var fragment = root_1();
	var div = $.first_child(fragment);
	var h1 = $.child(div);
	var input = $.sibling($.child(h1));

	$.remove_input_defaults(input);
	$.reset(h1);
	$.reset(div);

	var node = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var h2 = $.child(div_1);
			var input_1 = $.sibling($.child(h2));

			$.remove_input_defaults(input_1);
			$.reset(h2);
			$.reset(div_1);
			$.bind_checked(input_1, $showACLPagesStore, ($$value) => $.store_set(showACLPagesStore, $$value));
			$.transition(5, div_1, () => fade);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (showDevSettings) $$render(consequent);
		});
	}

	$.bind_checked(input, () => showDevSettings, ($$value) => showDevSettings = $$value);
	$.append($$anchor, fragment);
	$$cleanup();
}