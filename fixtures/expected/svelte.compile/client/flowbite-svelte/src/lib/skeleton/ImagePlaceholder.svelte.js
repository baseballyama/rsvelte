import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { imagePlaceholder } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'rounded',
	'imgOnly',
	'class',
	'classes'
]);

var root = $.from_html(`<div><div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div></div>`);
var root_1 = $.from_html(`<div><div><svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"></path></svg></div> <!> <span class="sr-only">Loading...</span></div>`);

export default function ImagePlaceholder($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, "md"),
		imgOnly = $.prop($$props, 'imgOnly', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("imagePlaceholder"));

	const $$d = $.derived(() => imagePlaceholder({ size: size(), rounded: $$props.rounded })),
		base = $.derived(() => $.get($$d).base),
		image = $.derived(() => $.get($$d).image),
		svg = $.derived(() => $.get($$d).svg),
		content = $.derived(() => $.get($$d).content),
		line = $.derived(() => $.get($$d).line);

	var div = root_1();

	$.attribute_effect(div, ($0) => ({ role: 'status', ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($$props.class, $.get(theme)?.base) })
	]);

	var div_1 = $.child(div);
	var svg_1 = $.only_child(div_1);
	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var div_3 = $.child(div_2);
			var div_4 = $.sibling(div_3, 2);
			var div_5 = $.sibling(div_4, 2);
			var div_6 = $.sibling(div_5, 2);
			var div_7 = $.sibling(div_6, 2);
			var div_8 = $.sibling(div_7, 2);
			var div_9 = $.sibling(div_8, 2);

			$.reset(div_2);

			$.template_effect(
				($0, $1, $2, $3, $4, $5, $6, $7) => {
					$.set_class(div_2, 1, $0);
					$.set_class(div_3, 1, $1);
					$.set_class(div_4, 1, $2);
					$.set_class(div_5, 1, $3);
					$.set_class(div_6, 1, $4);
					$.set_class(div_7, 1, $5);
					$.set_class(div_8, 1, $6);
					$.set_class(div_9, 1, $7);
				},
				[
					() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $$props.classes?.content) })),
					() => $.clsx($.get(line)({
						class: clsx("mb-4 h-2.5 w-1/2", $.get(theme)?.line, $$props.classes?.line)
					})),

					() => $.clsx($.get(line)({
						class: clsx("mb-2.5 h-2 w-9/12", $.get(theme)?.line, $$props.classes?.line)
					})),

					() => $.clsx($.get(line)({
						class: clsx("mb-2.5 h-2", $.get(theme)?.line, $$props.classes?.line)
					})),

					() => $.clsx($.get(line)({
						class: clsx("mb-2.5 h-2", $.get(theme)?.line, $$props.classes?.line)
					})),

					() => $.clsx($.get(line)({
						class: clsx("mb-2.5 h-2 w-10/12", $.get(theme)?.line, $$props.classes?.line)
					})),

					() => $.clsx($.get(line)({
						class: clsx("mb-2.5 h-2 w-11/12", $.get(theme)?.line, $$props.classes?.line)
					})),

					() => $.clsx($.get(line)({
						class: clsx("h-2 w-9/12", $.get(theme)?.line, $$props.classes?.line)
					}))
				]
			);

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (!imgOnly()) $$render(consequent);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_class(div_1, 1, $0);
			$.set_class(svg_1, 0, $1);
		},
		[
			() => $.clsx($.get(image)({ class: clsx($.get(theme)?.image, $$props.classes?.image) })),
			() => $.clsx($.get(svg)({ class: clsx($.get(theme)?.svg, $$props.classes?.svg) }))
		]
	);

	$.append($$anchor, div);
	$.pop();
}