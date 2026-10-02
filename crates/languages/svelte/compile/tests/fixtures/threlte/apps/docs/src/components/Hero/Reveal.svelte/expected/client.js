import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';

var root = $.from_html(`<div class="reveal svelte-mjyag7"><!></div>`);

export default function Reveal($$anchor, $$props) {
	$.push($$props, true);

	let from = $.prop($$props, 'from', 3, 0),
		to = $.prop($$props, 'to', 3, 1);

	let p = $.derived(() => MathUtils.clamp(MathUtils.mapLinear($$props.progress, from(), to(), 0, 1), 0, 1));
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.template_effect(() => $.set_style(div, `--progress: ${$.get(p) ?? ''};`));
	$.append($$anchor, div);
	$.pop();
}