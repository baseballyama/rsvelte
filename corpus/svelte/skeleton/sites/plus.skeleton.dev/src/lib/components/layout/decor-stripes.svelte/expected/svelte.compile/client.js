import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section><!></section>`);

export default function Decor_stripes($$anchor, $$props) {
	var section = root();
	var node = $.child(section);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(section);
	$.template_effect(() => $.set_class(section, 1, $.clsx(['stripes', $$props.class]), 'svelte-1kmb2yx'));
	$.append($$anchor, section);
}