import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p id="prerendered-data"> </p>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${$$props.data.r1 ?? ''}
	${$$props.data.r2 ?? ''}
	${$$props.data.r3 ?? ''}
	${$$props.data.r4 ?? ''}`));

	$.append($$anchor, p);
	$.pop();
}