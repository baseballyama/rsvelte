import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta/> <meta/>`, 1);

export default function B($$anchor, $$props) {
	$.head('mlra5d', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);

		$.template_effect(() => {
			$.set_attribute(meta, 'name', `${$$props.name ?? ''}-1`);
			$.set_attribute(meta, 'content', `${$$props.content ?? ''}-1`);
			$.set_attribute(meta_1, 'name', `${$$props.name ?? ''}-2`);
			$.set_attribute(meta_1, 'content', `${$$props.content ?? ''}-2`);
		});

		$.append($$anchor, fragment);
	});
}