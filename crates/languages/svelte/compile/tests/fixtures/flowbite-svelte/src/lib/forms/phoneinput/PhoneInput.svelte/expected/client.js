import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { phoneInput } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'phoneIcon',
	'pattern',
	'phoneType',
	'floatingLabel',
	'labelFor',
	'class',
	'classes'
]);

var root = $.from_svg(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 19 18"><path d="M18 13.446a3.02 3.02 0 0 0-.946-1.985l-1.4-1.4a3.054 3.054 0 0 0-4.218 0l-.7.7a.983.983 0 0 1-1.39 0l-2.1-2.1a.983.983 0 0 1 0-1.389l.7-.7a2.98 2.98 0 0 0 0-4.217l-1.4-1.4a2.824 2.824 0 0 0-4.218 0c-3.619 3.619-3 8.229 1.752 12.979C6.785 16.639 9.45 18 11.912 18a7.175 7.175 0 0 0 5.139-2.325A2.9 2.9 0 0 0 18 13.446Z"></path></svg>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div class="relative"><!> <input/></div>`);
var root_3 = $.from_html(`<span><!></span>`);
var root_4 = $.from_html(`<div class="relative"><!> <input/> <label> </label></div>`);

export default function PhoneInput($$anchor, $$props) {
	$.push($$props, true);

	const phoneIconSnippet = ($$anchor) => {
		var svg_1 = root();

		$.template_effect(($0) => $.set_class(svg_1, 0, $0), [() => $.clsx($.get(svg)({ class: clsx($.get(theme)?.svg) }))]);
		$.append($$anchor, svg_1);
	};

	let phoneIcon = $.prop($$props, 'phoneIcon', 3, true),
		pattern = $.prop($$props, 'pattern', 3, "[0-9]{3}-[0-9]{3}-[0-9]{4}"),
		phoneType = $.prop($$props, 'phoneType', 3, "default"),
		floatingLabel = $.prop($$props, 'floatingLabel', 3, "Phone number"),
		labelFor = $.prop($$props, 'labelFor', 3, "floating-phone-number"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("phoneInput"));

	const $$d = $.derived(() => phoneInput({ phoneType: phoneType(), phoneIcon: phoneIcon() })),
		div = $.derived(() => $.get($$d).div),
		svg = $.derived(() => $.get($$d).svg),
		input = $.derived(() => $.get($$d).input),
		span = $.derived(() => $.get($$d).span),
		floatingInput = $.derived(() => $.get($$d).floatingInput),
		label = $.derived(() => $.get($$d).label);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_2();
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var div_2 = root_1();
					var node_2 = $.child(div_2);

					phoneIconSnippet(node_2);
					$.reset(div_2);

					$.template_effect(($0) => $.set_class(div_2, 1, $0), [
						() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $$props.classes?.div) }))
					]);

					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if (phoneIcon()) $$render(consequent);
				});
			}

			var input_1 = $.sibling(node_1, 2);

			$.attribute_effect(
				input_1,
				($0) => ({ type: 'tel', pattern: pattern(), ...restProps, class: $0 }),
				[
					() => $.get(input)({ class: clsx($.get(theme)?.input, $$props.classes?.input) })
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_3 = ($$anchor) => {
			var div_3 = root_4();
			var node_3 = $.child(div_3);

			{
				var consequent_2 = ($$anchor) => {
					var span_1 = root_3();
					var node_4 = $.child(span_1);

					phoneIconSnippet(node_4);
					$.reset(span_1);

					$.template_effect(($0) => $.set_class(span_1, 1, $0), [
						() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $$props.classes?.span) }))
					]);

					$.append($$anchor, span_1);
				};

				$.if(node_3, ($$render) => {
					if (phoneIcon()) $$render(consequent_2);
				});
			}

			var input_2 = $.sibling(node_3, 2);

			$.attribute_effect(
				input_2,
				($0) => ({ type: 'tel', class: $0, pattern: pattern(), ...restProps }),
				[
					() => $.get(floatingInput)({
						class: clsx($.get(theme)?.floatingInput, $$props.classes?.floatingInput)
					})
				],
				void 0,
				void 0,
				void 0,
				true
			);

			var label_1 = $.sibling(input_2, 2);
			var text = $.only_child(label_1, true);

			$.reset(div_3);

			$.template_effect(
				($0) => {
					$.set_attribute(label_1, 'for', labelFor());
					$.set_class(label_1, 1, $0);
					$.set_text(text, floatingLabel());
				},
				[
					() => $.clsx($.get(label)({ class: clsx($.get(theme)?.label, $$props.classes?.label) }))
				]
			);

			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if (phoneType() === "default" || phoneType() === "countryCode") $$render(consequent_1); else if (phoneType() === "floating") $$render(consequent_3, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}