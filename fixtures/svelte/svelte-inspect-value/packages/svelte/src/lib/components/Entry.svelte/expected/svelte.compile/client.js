import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

var root = $.from_html(`<div role="listitem" class="entry"><!></div>`);

export default function Entry($$anchor, $$props) {
	$.push($$props, true);

	let i = $.prop($$props, 'i', 3, 0);
	const options = useOptions();
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.template_effect(() => $.set_style(div, `--i: ${i() ?? ''}`));
	$.transition(3, div, () => slide, () => ({ duration: options.transitionDuration }));
	$.append($$anchor, div);
	$.pop();
}