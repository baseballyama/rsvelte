import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as DialogPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function Dialog_portal($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	const children_render = $.derived(() => $$props.children);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(children_render) ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.component(node, () => DialogPrimitive.Portal, ($$anchor, DialogPrimitive_Portal) => {
			DialogPrimitive_Portal($$anchor, { children, $$slots: { default: true } });
		});
	}

	$.append($$anchor, fragment);
}