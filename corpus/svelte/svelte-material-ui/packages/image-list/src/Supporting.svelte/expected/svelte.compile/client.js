import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClassAdder } from '@smui/common/classadder';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function Supporting($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let element;

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };

	$.bind_this(
		ClassAdder($$anchor, $.spread_props({ _smuiClass: 'mdc-image-list__supporting', tag: 'div' }, () => restProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		})),
		($$value) => element = $$value,
		() => element
	);

	return $.pop($$exports);
}