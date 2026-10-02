import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="label svelte-1ajgon7"> </div>`);

export default function Labels_html($$anchor, $$props) {
	$.push($$props, true);

	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { xGet, yGet } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {Array<Object>} labels - An array of objects that contain a field containing text label and data fields.
	 * @property {Function} getLabelName - An accessor function to return the label field on your objects in the `labels` array.
	 * @property {Function} [formatLabelName] - An optional formatting function.
	 */
	/** @type {Props} */
	let formatLabelName = $.prop($$props, 'formatLabelName', 3, (d) => d);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.labels, $.index, ($$anchor, d) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(
			($0, $1, $2) => {
				$.set_style(div, `
      top:${$0 ?? ''}px;
      left:${$1 ?? ''}px;
    `);

				$.set_text(text, $2);
			},
			[
				() => $yGet()($.get(d)),
				() => $xGet()($.get(d)),
				() => formatLabelName()($$props.getLabelName($.get(d)))
			]
		);

		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}