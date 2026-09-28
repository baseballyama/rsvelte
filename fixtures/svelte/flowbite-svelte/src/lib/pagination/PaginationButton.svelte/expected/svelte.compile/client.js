import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { paginationButton } from "./theme";
import { getPaginationContext } from "$lib/context";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'size',
	'onclick',
	'disabled',
	'class',
	'href',
	'active'
]);

var root = $.from_html(`<a><!></a>`);
var root_1 = $.from_html(`<button><!></button>`);

export default function PaginationButton($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		active = $.prop($$props, 'active', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("paginationButton"));

	// Get context - it will be undefined if used outside Pagination
	const ctx = getPaginationContext();

	const paginationCls = $.derived(() => {
		if (active() && ctx?.activeClasses) {
			return paginationButton({
				size: ctx?.size ?? $$props.size,
				active: false, // Set to false to avoid theme's active styles
				group: ctx?.group ?? false,
				table: ctx?.table ?? false,
				disabled: disabled(),
				class: clsx($.get(theme), ctx.activeClasses, $$props.class)
			});
		}

		// Use default theme styles
		return paginationButton({
			size: ctx?.size ?? $$props.size,
			active: active(),
			group: ctx?.group ?? false,
			table: ctx?.table ?? false,
			disabled: disabled(),
			class: clsx($.get(theme), $$props.class)
		});
	});

	function handleClick(e) {
		if (disabled()) {
			e.preventDefault();

			return;
		}

		if ($$props.onclick) $$props.onclick();
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var a = root();

			$.attribute_effect(a, () => ({
				href: $$props.href,
				...restProps,
				class: $.get(paginationCls),
				onclick: handleClick
			}));

			var node_1 = $.child(a);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.children);
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent);
				});
			}

			$.reset(a);
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var button = root_1();

			$.attribute_effect(button, () => ({
				...restProps,
				disabled: disabled(),
				class: $.get(paginationCls),
				onclick: handleClick
			}));

			var node_3 = $.child(button);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_4 = $.first_child(fragment_2);

					$.snippet(node_4, () => $$props.children);
					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.children) $$render(consequent_2);
				});
			}

			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.href) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}