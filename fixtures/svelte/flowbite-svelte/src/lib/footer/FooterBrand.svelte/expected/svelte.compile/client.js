import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { footerBrand } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'aClass',
	'spanClass',
	'imgClass',
	'href',
	'src',
	'alt',
	'name'
]);

var root = $.from_html(`<img/>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<a><!> <!> <!></a>`);

export default function FooterBrand($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("footerBrand"));

	const $$d = $.derived(footerBrand),
		base = $.derived(() => $.get($$d).base),
		span = $.derived(() => $.get($$d).span),
		img = $.derived(() => $.get($$d).img);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var a = root_2();

			$.attribute_effect(a, ($0) => ({ ...restProps, href: $$props.href, class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.aClass) })
			]);

			var node_1 = $.child(a);

			{
				var consequent = ($$anchor) => {
					var img_1 = root();

					$.template_effect(
						($0) => {
							$.set_attribute(img_1, 'src', $$props.src);
							$.set_class(img_1, 1, $0);
							$.set_attribute(img_1, 'alt', $$props.alt);
						},
						[
							() => $.clsx($.get(img)({ class: clsx($.get(theme)?.img, $$props.imgClass) }))
						]
					);

					$.append($$anchor, img_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.src) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root_1();
					var text = $.only_child(span_1, true);

					$.template_effect(
						($0) => {
							$.set_class(span_1, 1, $0);
							$.set_text(text, $$props.name);
						},
						[
							() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $$props.spanClass) }))
						]
					);

					$.append($$anchor, span_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.name) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_4 = $.first_child(fragment_1);

					$.snippet(node_4, () => $$props.children);
					$.append($$anchor, fragment_1);
				};

				$.if(node_3, ($$render) => {
					if ($$props.children) $$render(consequent_2);
				});
			}

			$.reset(a);
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var img_2 = root();

			$.template_effect(
				($0) => {
					$.set_attribute(img_2, 'src', $$props.src);
					$.set_class(img_2, 1, $0);
					$.set_attribute(img_2, 'alt', $$props.alt);
				},
				[() => $.clsx($.get(img)({ class: clsx($$props.imgClass) }))]
			);

			$.append($$anchor, img_2);
		};

		$.if(node, ($$render) => {
			if ($$props.href) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}