import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<h1 id="always" class="svelte-1ui5twj">This is always rendered</h1> <button>show component</button> <!>`, 1);

export default function _page($$anchor) {
	let show = false;
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (show) $$render(consequent);
		});
	}

	$.delegated('click', button, () => show = !show);
	$.append($$anchor, fragment);
}

$.delegate(['click']);