import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';

var root = $.from_html(`<div><!></div>`);

export default function FadeOut($$anchor, $$props) {
	$.push($$props, true);

	let from = $.prop($$props, 'from', 3, 0),
		to = $.prop($$props, 'to', 3, 1);

	let p = $.derived(() => MathUtils.clamp(MathUtils.mapLinear($$props.progress, from(), to(), 1, 0), 0, 1));
	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(p) > 0) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_style(div, `opacity: ${$.get(p) ?? ''};`));
	$.append($$anchor, div);
	$.pop();
}