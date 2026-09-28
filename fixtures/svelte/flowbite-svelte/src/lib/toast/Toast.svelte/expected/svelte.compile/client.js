import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CloseButton from "$lib/utils/CloseButton.svelte";
import { toast } from "./theme";
import { fly } from "svelte/transition";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'icon',
	'toastStatus',
	'dismissable',
	'closeAriaLabel',
	'color',
	'position',
	'iconClass',
	'contentClass',
	'align',
	'params',
	'transition',
	'class',
	'classes'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><!> <div><!></div> <!></div>`);

export default function Toast($$anchor, $$props) {
	$.push($$props, true);

	let toastStatus = $.prop($$props, 'toastStatus', 15, true),
		dismissable = $.prop($$props, 'dismissable', 3, true),
		closeAriaLabel = $.prop($$props, 'closeAriaLabel', 3, "Remove toast"),
		color = $.prop($$props, 'color', 3, "primary"),
		align = $.prop($$props, 'align', 3, true),
		transition = $.prop($$props, 'transition', 3, fly),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Toast",
		untrack(() => ({
			iconClass: $$props.iconClass,
			contentClass: $$props.contentClass
		})),
		{ iconClass: "icon", contentClass: "content" }
	);

	const styling = $.derived(() => $$props.classes ?? { icon: $$props.iconClass, content: $$props.contentClass });
	const theme = $.derived(() => getTheme("toast"));

	const $$d = $.derived(() => toast({ color: color(), position: $$props.position, align: align() })),
		base = $.derived(() => $.get($$d).base),
		iconVariants = $.derived(() => $.get($$d).icon),
		content = $.derived(() => $.get($$d).content),
		close = $.derived(() => $.get($$d).close);

	let ref = $.state(undefined);

	function _close() {
		if ($.get(ref)?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
			toastStatus(false);
		}
	}

	createDismissableContext(_close);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, ($0) => ({ role: 'alert', ...restProps, class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();
					var node_2 = $.child(div_1);

					$.snippet(node_2, () => $$props.icon);
					$.reset(div_1);

					$.template_effect(($0) => $.set_class(div_1, 1, $0), [
						() => $.clsx($.get(iconVariants)({ class: clsx($.get(theme)?.icon, $.get(styling).icon) }))
					]);

					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.icon) $$render(consequent);
				});
			}

			var div_2 = $.sibling(node_1, 2);
			var node_3 = $.child(div_2);

			$.snippet(node_3, () => $$props.children);
			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(close)({ class: clsx($.get(theme)?.close, $$props.classes?.close) }));

						CloseButton($$anchor, {
							get class() {
								return $.get($0);
							},

							get ariaLabel() {
								return closeAriaLabel();
							},

							get color() {
								return color();
							}
						});
					}
				};

				$.if(node_4, ($$render) => {
					if (dismissable()) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));

			$.template_effect(($0) => $.set_class(div_2, 1, $0), [
				() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $.get(styling).content) }))
			]);

			$.transition(3, div, transition, () => $$props.params);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (toastStatus()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}