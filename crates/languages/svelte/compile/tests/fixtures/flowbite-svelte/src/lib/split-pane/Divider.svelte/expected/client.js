import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { divider, dividerHitArea } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { nonPassiveTouch } from "$lib/utils/nonPassiveTouch";

var root = $.from_html(`<div role="separator" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div></div></div>`);

export default function Divider($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, "");
	const themeDivider = $.derived(() => getTheme("divider"));
	const themeDividerHitArea = $.derived(() => getTheme("dividerHitArea"));
	const isHorizontal = $.derived(() => $$props.direction === "horizontal");
	const roundedSize = $.derived(() => Math.round($$props.currentSize));
	var div = root();
	var div_1 = $.only_child(div);

	$.action(div, ($$node, $$action_arg) => nonPassiveTouch?.($$node, $$action_arg), () => (e) => $$props.onTouchStart(e, $$props.index));

	$.template_effect(
		($0, $1) => {
			$.set_attribute(div, 'aria-orientation', $.get(isHorizontal) ? "vertical" : "horizontal");
			$.set_attribute(div, 'aria-label', `Resize ${$.get(isHorizontal) ? "horizontal" : "vertical"} panes`);
			$.set_attribute(div, 'aria-valuenow', $.get(roundedSize));
			$.set_attribute(div, 'aria-valuetext', `${$.get(roundedSize)} percent`);
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
		},
		[
			() => $.clsx(divider({
				direction: $$props.direction,
				isDragging: $$props.isDragging,
				class: clsx($.get(themeDivider), className())
			})),

			() => $.clsx(dividerHitArea({
				direction: $$props.direction,
				class: clsx($.get(themeDividerHitArea), className())
			}))
		]
	);

	$.delegated('mousedown', div, (e) => $$props.onMouseDown(e, $$props.index));
	$.delegated('keydown', div, (e) => $$props.onKeyDown(e, $$props.index));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousedown', 'keydown']);