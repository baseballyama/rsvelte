import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';

var root = $.from_svg(`<g class="lc-blur-g"><!></g>`);
var root_1 = $.from_svg(`<defs><filter class="lc-blur-filter"><feGaussianBlur in="SourceGraphic"></feGaussianBlur></filter></defs><!>`, 1);

export default function Blur_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('blur-', uid)),
		stdDeviation = $.prop($$props, 'stdDeviation', 3, 5);

	var fragment = root_1();
	var defs = $.first_child(fragment);
	var filter = $.child(defs);
	var feGaussianBlur = $.only_child(filter);

	$.reset(defs);

	var node = $.sibling(defs);

	{
		var consequent = ($$anchor) => {
			var g = root();
			var node_1 = $.child(g);

			$.snippet(node_1, () => $$props.children);
			$.reset(g);
			$.template_effect(() => $.set_attribute(g, 'filter', `url(#${id() ?? ''})`));
			$.append($$anchor, g);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.template_effect(() => {
		$.set_attribute(filter, 'id', id());
		$.set_attribute(feGaussianBlur, 'stdDeviation', stdDeviation());
	});

	$.append($$anchor, fragment);
	$.pop();
}