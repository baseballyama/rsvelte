import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toaster, toast } from '$lib/index.js';

var root = $.from_html(`<div data-testid="default-toaster"><!></div> <div data-testid="named-toaster"><!></div> <button data-testid="trigger">Trigger</button>`, 1);

export default function MultiToasterTest($$anchor, $$props) {
	$.push($$props, true);

	function onClick() {
		$$props.cb(toast);
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Toaster(node, {});
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Toaster(node_1, { id: 'secondary', position: 'top-center' });
	$.reset(div_1);

	var button = $.sibling(div_1, 2);

	$.delegated('click', button, onClick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);