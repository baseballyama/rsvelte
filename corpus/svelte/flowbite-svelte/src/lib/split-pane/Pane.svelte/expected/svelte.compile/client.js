import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getSplitPaneContext } from "$lib/context";
import Divider from "./Divider.svelte";
import { pane } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

var root = $.from_html(`<div><!></div> <!>`, 1);

export default function Pane($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ""),
		style = $.prop($$props, 'style', 3, "");

	const theme = $.derived(() => getTheme("pane"));
	const context = getSplitPaneContext();
	const paneIndex = context ? context.registerPane() : 0;

	const paneStyle = $.derived(() => {
		const styles = [style()];

		if (context) {
			const contextStyle = context.getPaneStyle(paneIndex);

			styles.push(contextStyle);
		}

		return styles.filter(Boolean).join("; ");
	});

	const showDivider = $.derived(() => context?.shouldRenderDivider(paneIndex) ?? false);
	const direction = $.derived(() => context?.getDirection() ?? "horizontal");
	const isDragging = $.derived(() => context?.getIsDragging() ?? false);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => context.getPaneSize(paneIndex));

				Divider($$anchor, {
					get direction() {
						return $.get(direction);
					},

					get index() {
						return paneIndex;
					},

					get isDragging() {
						return $.get(isDragging);
					},

					get currentSize() {
						return $.get($0);
					},

					get onMouseDown() {
						return context.onMouseDown;
					},

					get onTouchStart() {
						return context.onTouchStart;
					},

					get onKeyDown() {
						return context.onKeyDown;
					}
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(showDivider) && context) $$render(consequent);
		});
	}

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_style(div, $.get(paneStyle));
		},
		[
			() => $.clsx(pane({ class: clsx($.get(theme), className()) }))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}