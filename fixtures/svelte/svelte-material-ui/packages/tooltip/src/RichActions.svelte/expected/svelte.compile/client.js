import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { ClassAdder } from '@smui/common/classadder';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function RichActions($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let element;

	setContext('SMUI:button:context', 'tooltip:rich-actions');

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };

	$.bind_this(
		ClassAdder($$anchor, $.spread_props(
			{
				_smuiClass: 'mdc-tooltip--rich-actions',
				_smuiContexts: { 'SMUI:button:context': 'tooltip:rich-actions' },
				tag: 'div'
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					$.snippet(node, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		)),
		($$value) => element = $$value,
		() => element
	);

	return $.pop($$exports);
}