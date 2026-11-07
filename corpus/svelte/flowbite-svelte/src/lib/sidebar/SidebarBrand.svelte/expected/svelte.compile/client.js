import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { sidebarBrand } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'site',
	'imgClass',
	'spanClass',
	'class',
	'classes'
]);

var root = $.from_html(`<img/> <span> </span>`, 1);
var root_1 = $.from_html(`<a><!></a>`);

export default function SidebarBrand($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("SidebarBrand", untrack(() => ({ imgClass: $$props.imgClass, spanClass: $$props.spanClass })), { imgClass: "img", spanClass: "span" });

	const styling = $.derived(() => $$props.classes ?? { img: $$props.imgClass, span: $$props.spanClass });
	const theme = $.derived(() => getTheme("sidebarBrand"));

	const $$d = $.derived(sidebarBrand),
		base = $.derived(() => $.get($$d).base),
		img = $.derived(() => $.get($$d).img),
		span = $.derived(() => $.get($$d).span);

	var a = root_1();

	$.attribute_effect(
		a,
		($0) => ({
			...restProps,
			href: $$props.site?.href ? $$props.site.href : "/",
			class: $0
		}),
		[
			() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
		]
	);

	var node = $.child(a);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var img_1 = $.first_child(fragment);
			var span_1 = $.sibling(img_1, 2);
			var text = $.only_child(span_1, true);

			$.template_effect(
				($0, $1) => {
					$.set_attribute(img_1, 'src', $$props.site.img);
					$.set_class(img_1, 1, $0);
					$.set_attribute(img_1, 'alt', $$props.site.name);
					$.set_class(span_1, 1, $1);
					$.set_text(text, $$props.site.name);
				},
				[
					() => $.clsx($.get(img)({ class: clsx($.get(theme)?.img, $.get(styling).img) })),
					() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) }))
				]
			);

			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.site) $$render(consequent); else if ($$props.children) $$render(consequent_1, 1);
		});
	}

	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}