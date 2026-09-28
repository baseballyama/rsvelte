import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toaster, toast } from '$lib/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'cb']);
var root = $.from_html(`<!> <button data-testid="trigger">Trigger</button>`, 1);

export default function PropsToastTest($$anchor, $$props) {
	$.push($$props, true);

	const toasterProps = $.rest_props($$props, rest_excludes);

	function onClick() {
		$$props.cb(toast);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Toaster(node, $.spread_props(() => toasterProps));

	var button = $.sibling(node, 2);

	$.delegated('click', button, onClick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);