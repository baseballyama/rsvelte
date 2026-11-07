import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "@svar-ui/lib-dom";

var root = $.from_html(`<div><!></div>`);

export default function InlineDropdown($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 7, "bottom"),
		align = $.prop($$props, 'align', 7, "start"),
		autoFit = $.prop($$props, 'autoFit', 3, true),
		oncancel = $.prop($$props, 'oncancel', 3, null),
		width = $.prop($$props, 'width', 3, "100%"),
		css = $.prop($$props, 'css', 3, "");

	let node;

	$.user_effect(() => {
		if (autoFit()) {
			const nodeCoords = node.getBoundingClientRect();
			const bodyCoords = document.body.getBoundingClientRect();

			if (nodeCoords.right >= bodyCoords.right) {
				align("end");
			}

			if (nodeCoords.bottom >= bodyCoords.bottom) {
				position("top");
			}

			return `${position()}-${align()}`;
		}
	});

	function down(e) {
		oncancel() && oncancel()(e);
	}

	var div = root();
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => down);
	$.bind_this(div, ($$value) => node = $$value, () => node);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-dropdown ${`wx-${position()}-${align()}`} ${css() ?? ''}`, 'svelte-12vw1za');
		$.set_style(div, `width:${width() ?? ''}`);
	});

	$.append($$anchor, div);
	$.pop();
}