import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello</p>`);

var root_1 = $.from_html(`<!><button>change</button>`, 1);

export default function Boundary_reactive($$anchor) {
	let onerror = $.state(() => {});
	var fragment = root_1();
	var node = $.first_child(fragment);
	$.boundary(node, { get onerror() {
		return $.get(onerror);
	} }, ($$anchor) => {
		var p = root();
		$.append($$anchor, p);
	});
	var button = $.sibling(node);
	$.delegated('click', button, () => $.set(onerror, () => {}));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
