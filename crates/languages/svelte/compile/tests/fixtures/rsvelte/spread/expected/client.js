import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

var root = $.from_html(`<div>plain</div> <section>ordered</section> <button>typed by the spread</button> <img/>`, 1);

export default function Spread($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = root();
	var div = $.first_child(fragment);
	$.attribute_effect(div, () => ({ ...rest }));
	var section = $.sibling(div, 2);
	$.attribute_effect(section, () => ({ id: 'main', ...rest, title: 'after' }));
	var button = $.sibling(section, 2);
	$.attribute_effect(button, () => ({ ...rest }));
	var img = $.sibling(button, 2);
	$.attribute_effect(img, () => ({ ...rest, alt: '' }));
	$.replay_events(img);
	$.append($$anchor, fragment);
}
