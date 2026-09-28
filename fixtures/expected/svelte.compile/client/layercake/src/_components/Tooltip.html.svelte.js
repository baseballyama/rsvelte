import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="tooltip svelte-1l32xnv"><!></div>`);

export default function Tooltip_html($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {MouseEvent} event - The mouse event that triggered the tooltip.
	 * @property {number} [offset=-35] - A y-offset from the hover point, in pixels.
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let offset = $.prop($$props, 'offset', 19, () => -35);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);

			$.template_effect(() => $.set_style(div, `
      top:${$$props.event.layerY + offset()}px;
      left:${$$props.event.layerX ?? ''}px;
    `));

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.event.layerX !== undefined && $$props.event.layerY !== undefined) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}