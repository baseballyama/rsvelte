import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div><!></div></div>`);

export default function Command_wrapper($$anchor, $$props) {
	var div = root();

	$.set_style(div, '', {}, { position: 'relative', width: '100%' });

	var div_1 = $.child(div);

	$.set_style(div_1, '', {}, {
		height: '475px',
		width: '100%',
		position: 'absolute',
		top: '0',
		left: '0'
	});

	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}