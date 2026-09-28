import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toolbarButton } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'name',
	'aria-label',
	'size',
	'class'
]);

var root = $.from_html(`<span class="sr-only"> </span>`);
var root_1 = $.from_html(`<button><!> <!></button>`);
var root_2 = $.from_html(`<a><!> <!></a>`);

export default function ToolbarButton($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("toolbarButton"));

	const buttonCls = $.derived(() => toolbarButton({
		color: $$props.color,
		size: $$props.size,
		background: false,
		class: clsx($.get(theme), $$props.class)
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var button = root_1();

			$.attribute_effect(button, () => ({
				type: 'button',
				...restProps,
				class: $.get(buttonCls),
				'aria-label': $$props['aria-label'] ?? $$props.name
			}));

			var node_1 = $.child(button);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, $$props.name));
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if ($$props.name) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(button);
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var a = root_2();

			$.attribute_effect(a, () => ({
				...restProps,
				class: $.get(buttonCls),
				'aria-label': $$props['aria-label'] ?? $$props.name
			}));

			var node_3 = $.child(a);

			{
				var consequent_2 = ($$anchor) => {
					var span_1 = root();
					var text_1 = $.only_child(span_1, true);

					$.template_effect(() => $.set_text(text_1, $$props.name));
					$.append($$anchor, span_1);
				};

				$.if(node_3, ($$render) => {
					if ($$props.name) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			$.snippet(node_4, () => $$props.children ?? $.noop);
			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.href === undefined) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}