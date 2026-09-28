import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TimeField } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<div><!></div>`);

export default function Time_field($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => TimeField.Root, ($$anchor, TimeField_Root) => {
		TimeField_Root($$anchor, $.spread_props(() => restProps, {
			children: ($$anchor, $$slotProps) => {
				var div = root();
				var node_1 = $.child(div);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.reset(div);
				$.template_effect(() => $.set_class(div, 1, $.clsx($$props.class)));
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}