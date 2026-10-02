import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { closeButton } from "./theme";
import { useDismiss } from "./dismissable";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'onclick',
	'name',
	'ariaLabel',
	'size',
	'class',
	'svgClass'
]);

var root = $.from_html(`<span class="sr-only"> </span>`);
var root_1 = $.from_svg(`<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`);
var root_2 = $.from_html(`<button><!> <!></button>`);
var root_3 = $.from_html(`<a><!> <!></a>`);

export default function CloseButton($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, "gray"),
		name = $.prop($$props, 'name', 3, "Close"),
		size = $.prop($$props, 'size', 3, "md"),
		restProps = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(() => closeButton({ color: color(), size: size() })),
		base = $.derived(() => $.get($$d).base),
		svg = $.derived(() => $.get($$d).svg);

	const context = useDismiss();

	function onclick(event) {
		$$props.onclick?.(event);

		if (event.defaultPrevented) return;

		context?.dismiss?.(event);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var button = root_2();

			$.attribute_effect(
				button,
				($0) => ({
					type: 'button',
					...restProps,
					class: $0,
					onclick,
					'aria-label': $$props.ariaLabel ?? name()
				}),
				[() => $.get(base)({ class: clsx($$props.class) })]
			);

			var node_1 = $.child(button);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, name()));
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if (name()) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.snippet(node_3, () => $$props.children);
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var svg_1 = root_1();

					$.template_effect(($0) => $.set_class(svg_1, 0, $0), [() => $.clsx($.get(svg)({ class: $$props.svgClass }))]);
					$.append($$anchor, svg_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(button);
			$.append($$anchor, button);
		};

		var alternate_2 = ($$anchor) => {
			var a = root_3();

			$.attribute_effect(
				a,
				($0) => ({
					...restProps,
					onclick,
					class: $0,
					'aria-label': $$props.ariaLabel ?? name()
				}),
				[() => $.get(base)({ class: clsx($$props.class) })]
			);

			var node_4 = $.child(a);

			{
				var consequent_3 = ($$anchor) => {
					var span_1 = root();
					var text_1 = $.only_child(span_1, true);

					$.template_effect(() => $.set_text(text_1, name()));
					$.append($$anchor, span_1);
				};

				$.if(node_4, ($$render) => {
					if (name()) $$render(consequent_3);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_6 = $.first_child(fragment_2);

					$.snippet(node_6, () => $$props.children);
					$.append($$anchor, fragment_2);
				};

				var alternate_1 = ($$anchor) => {
					var svg_2 = root_1();

					$.template_effect(($0) => $.set_class(svg_2, 0, $0), [() => $.clsx($.get(svg)())]);
					$.append($$anchor, svg_2);
				};

				$.if(node_5, ($$render) => {
					if ($$props.children) $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.href === undefined) $$render(consequent_2); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}