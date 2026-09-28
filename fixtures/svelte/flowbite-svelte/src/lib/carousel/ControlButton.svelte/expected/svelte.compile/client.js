import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { controlButton } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'forward',
	'name',
	'class',
	'spanClass'
]);

var root = $.from_svg(`<svg aria-hidden="true" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`);
var root_1 = $.from_svg(`<svg aria-hidden="true" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`);
var root_2 = $.from_html(`<span class="sr-only"> </span>`);
var root_3 = $.from_html(`<span><!> <!></span>`);
var root_4 = $.from_html(`<button><!></button>`);

export default function ControlButton($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(() => controlButton({ forward: $$props.forward })),
		base = $.derived(() => $.get($$d).base),
		span = $.derived(() => $.get($$d).span);

	const theme = $.derived(() => getTheme("controlButton"));
	var button = root_4();

	$.attribute_effect(button, ($0) => ({ type: 'button', class: $0, ...restProps }), [
		() => $.get(base)({ class: clsx($$props.class, $.get(theme)) })
	]);

	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		var alternate_1 = ($$anchor) => {
			var span_1 = root_3();
			var node_2 = $.child(span_1);

			{
				var consequent_1 = ($$anchor) => {
					var svg = root();

					$.append($$anchor, svg);
				};

				var alternate = ($$anchor) => {
					var svg_1 = root_1();

					$.append($$anchor, svg_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.forward) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var span_2 = root_2();
					var text = $.only_child(span_2, true);

					$.template_effect(() => $.set_text(text, $$props.name));
					$.append($$anchor, span_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.name) $$render(consequent_2);
				});
			}

			$.reset(span_1);

			$.template_effect(($0) => $.set_class(span_1, 1, $0), [
				() => $.clsx($.get(span)({ class: clsx($$props.spanClass) }))
			]);

			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.reset(button);
	$.append($$anchor, button);
	$.pop();
}