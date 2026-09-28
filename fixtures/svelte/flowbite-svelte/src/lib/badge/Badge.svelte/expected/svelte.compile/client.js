import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { fade } from "svelte/transition";
import { badge } from "./theme";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'icon',
	'badgeStatus',
	'color',
	'large',
	'dismissable',
	'closeAriaLabel',
	'class',
	'classes',
	'border',
	'href',
	'target',
	'rounded',
	'transition',
	'params',
	'aClass'
]);

var root = $.from_html(`<a><!></a>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Badge($$anchor, $$props) {
	$.push($$props, true);

	let badgeStatus = $.prop($$props, 'badgeStatus', 15, true),
		color = $.prop($$props, 'color', 3, "primary"),
		large = $.prop($$props, 'large', 3, false),
		dismissable = $.prop($$props, 'dismissable', 3, false),
		closeAriaLabel = $.prop($$props, 'closeAriaLabel', 3, "Remove badge"),
		transition = $.prop($$props, 'transition', 3, fade),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Badge", untrack(() => ({ aClass: $$props.aClass })), { aClass: "linkClass" });

	const styling = $.derived(() => $$props.classes ?? { linkClass: $$props.aClass });

	// Theme context
	const theme = $.derived(() => getTheme("badge"));

	const $$d = $.derived(() => badge({
			color: color(),
			size: large() ? "large" : "small",
			rounded: $$props.rounded,
			border: $$props.border
		})),
		base = $.derived(() => $.get($$d).base),
		linkClass = $.derived(() => $.get($$d).linkClass);

	let ref = $.state(undefined);

	const close = () => {
		if ($.get(ref)?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
			badgeStatus(false);
		}
	};

	createDismissableContext(close);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var a = root();
					var node_2 = $.child(a);

					$.snippet(node_2, () => $$props.children);
					$.reset(a);

					$.template_effect(
						($0) => {
							$.set_attribute(a, 'href', $$props.href);
							$.set_attribute(a, 'target', $$props.target);
							$.set_class(a, 1, $0);
						},
						[
							() => $.clsx($.get(linkClass)({
								class: clsx($.get(theme)?.linkClass, $.get(styling).linkClass)
							}))
						]
					);

					$.append($$anchor, a);
				};

				var alternate = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.snippet(node_3, () => $$props.children);
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.href) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_4 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_5 = $.first_child(fragment_2);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => large() ? "sm" : "xs");

								CloseButton($$anchor, {
									class: 'ms-1.5 -me-1.5',
									get color() {
										return color();
									},

									get size() {
										return $.get($0);
									},

									get ariaLabel() {
										return closeAriaLabel();
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.snippet(node_6, () => $$props.icon);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}
						};

						var alternate_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => large() ? "sm" : "xs");

								CloseButton($$anchor, {
									class: 'ms-1.5 -me-1.5',
									get color() {
										return color();
									},

									get size() {
										return $.get($0);
									},

									get ariaLabel() {
										return closeAriaLabel();
									}
								});
							}
						};

						$.if(node_5, ($$render) => {
							if ($$props.icon) $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node_4, ($$render) => {
					if (dismissable()) $$render(consequent_2);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.transition(3, div, transition, () => $$props.params);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (badgeStatus()) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}