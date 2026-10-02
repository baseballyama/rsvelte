import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function _3_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--rail-color': 'goldenrod' }));
		Slider(node.lastChild, {});
		$.reset(node);
	}

	$.append($$anchor, fragment);
}