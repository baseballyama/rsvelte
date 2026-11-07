import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { Spinner } from "$lib";
import { getTheme } from "$lib/theme/themeUtils";
import { button } from "./theme";
import { getButtonGroupContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'pill',
	'outline',
	'size',
	'color',
	'shadow',
	'tag',
	'disabled',
	'loading',
	'spinnerProps',
	'class'
]);

var root = $.from_html(`<a><!></a>`);
var root_1 = $.from_html(`<button><!> <!></button>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	const groupCtx = getButtonGroupContext();
	const group = groupCtx?.size;
	const ctxDisabled = groupCtx?.disabled;

	let outline = $.prop($$props, 'outline', 3, false),
		size = $.prop($$props, 'size', 3, "md"),
		shadow = $.prop($$props, 'shadow', 3, false),
		tag = $.prop($$props, 'tag', 3, "button"),
		loading = $.prop($$props, 'loading', 3, false),
		spinnerProps = $.prop($$props, 'spinnerProps', 19, () => ({ size: "4" })),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("button"));
	let actualSize = $.derived(() => group ? "sm" : size());
	let actualColor = $.derived(() => $$props.color ?? (group ? outline() ? "dark" : "alternative" : "primary"));
	let isDisabled = $.derived(() => Boolean(ctxDisabled) || Boolean($$props.disabled) || loading());

	const $$d = $.derived(() => button({
			color: $.get(actualColor),
			size: $.get(actualSize),
			disabled: $.get(isDisabled),
			pill: $$props.pill,
			group: !!group
		})),
		base = $.derived(() => $.get($$d).base),
		outline_ = $.derived(() => $.get($$d).outline),
		shadow_ = $.derived(() => $.get($$d).shadow),
		spinner = $.derived(() => $.get($$d).spinner);

	let btnCls = $.derived(() => $.get(base)({
		class: clsx(outline() && $.get(outline_)(), shadow() && $.get(shadow_)(), $.get(theme)?.base, $$props.class)
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();

			$.attribute_effect(a, () => ({ ...restProps, class: $.get(btnCls) }));

			var node_1 = $.child(a);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(a);
			$.append($$anchor, a);
		};

		var consequent_2 = ($$anchor) => {
			var button_1 = root_1();

			$.attribute_effect(button_1, () => ({
				type: 'button',
				...restProps,
				class: $.get(btnCls),
				disabled: $.get(isDisabled)
			}));

			var node_2 = $.child(button_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(spinner)());

						Spinner($$anchor, $.spread_props(spinnerProps, {
							get class() {
								return $.get($0);
							}
						}));
					}
				};

				$.if(node_3, ($$render) => {
					if (loading()) $$render(consequent_1);
				});
			}

			$.reset(button_1);
			$.append($$anchor, button_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.element(node_4, tag, false, ($$element, $$anchor) => {
				$.attribute_effect($$element, () => ({ ...restProps, class: $.get(btnCls) }));

				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.snippet(node_5, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.href !== undefined) $$render(consequent); else if (tag() === "button") $$render(consequent_2, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}