import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

var root = $.from_html(`<p>scoped</p> <p>scoped with class</p> <p>scoped with directive</p> <em>unscoped</em> <button type="button">toggle</button>`, 1);

export default function Spread_scoped($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	let open = $.state(false);
	var fragment = root();
	var p = $.first_child(fragment);
	$.attribute_effect(p, () => ({ ...props }), void 0, void 0, void 0, 'svelte-1py6098');
	var p_1 = $.sibling(p, 2);
	$.attribute_effect(p_1, () => ({ ...props, class: 'lead' }), void 0, void 0, void 0, 'svelte-1py6098');
	var p_2 = $.sibling(p_1, 2);
	$.attribute_effect(p_2, () => ({ ...props, [$.CLASS]: { open: $.get(open) } }), void 0, void 0, void 0, 'svelte-1py6098');
	var em = $.sibling(p_2, 2);
	$.attribute_effect(em, () => ({ ...props }), void 0, void 0, void 0, 'svelte-1py6098');
	var button = $.sibling(em, 2);
	$.delegated('click', button, () => $.set(open, !$.get(open)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
