import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from 'bits-ui';
import { useSplitButtonRootCtx } from './split-button.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open', 'children']);

export default function Split_button_select($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	const root = useSplitButtonRootCtx();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SelectPrimitive.Root, ($$anchor, SelectPrimitive_Root) => {
		SelectPrimitive_Root($$anchor, $.spread_props({ type: 'single', onValueChange: (v) => root.onSelect(v) }, () => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			get value() {
				return root.action;
			},

			set value($$value) {
				root.action = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}