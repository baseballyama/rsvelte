import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toaster, toast } from '$lib/index.js';

var root = $.from_html(`<!> <button data-testid="trigger">Trigger</button>`, 1);

export default function ToastTest($$anchor, $$props) {
	$.push($$props, true);

	function onClick() {
		$$props.cb(toast);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Toaster(node, {});

	var button = $.sibling(node, 2);

	$.delegated('click', button, onClick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);