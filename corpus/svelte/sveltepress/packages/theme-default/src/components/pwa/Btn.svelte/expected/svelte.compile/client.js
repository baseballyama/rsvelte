import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="button" tabindex="0"><!></div>`);

export default function Btn($$anchor, $$props) {
	const flat = $.prop($$props, 'flat', 3, false);
	var div = root();
	let classes;
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, 'btn svelte-nkycr9', null, classes, { primary: !flat(), flat: flat() }));

	$.delegated('click', div, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.delegated('keyup', div, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, div);
}

$.delegate(['click', 'keyup']);