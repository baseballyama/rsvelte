import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { breadcrumbItem } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'icon',
	'home',
	'href',
	'linkClass',
	'spanClass',
	'homeClass',
	'class',
	'classes'
]);

var root = $.from_svg(`<svg class="me-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>`);
var root_1 = $.from_html(`<a><!> <!></a>`);
var root_2 = $.from_svg(`<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>`);
var root_3 = $.from_html(`<a><!></a>`);
var root_4 = $.from_html(`<span><!></span>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<li><!></li>`);

export default function BreadcrumbItem($$anchor, $$props) {
	$.push($$props, true);

	let home = $.prop($$props, 'home', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const styling = $.derived(() => $$props.classes ?? {});
	const theme = $.derived(() => getTheme("breadcrumbItem"));

	const $$d = $.derived(() => breadcrumbItem({ home: home(), hasHref: !!$$props.href })),
		base = $.derived(() => $.get($$d).base),
		separator = $.derived(() => $.get($$d).separator);

	var li = root_6();

	$.attribute_effect(li, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var node = $.child(li);

	{
		var consequent_1 = ($$anchor) => {
			var a = root_1();
			var node_1 = $.child(a);

			{
				var consequent = ($$anchor) => {
					var fragment = $.comment();
					var node_2 = $.first_child(fragment);

					$.snippet(node_2, () => $$props.icon);
					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var svg = root();

					$.append($$anchor, svg);
				};

				$.if(node_1, ($$render) => {
					if ($$props.icon) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_3 = $.sibling(node_1, 2);

			$.snippet(node_3, () => $$props.children);
			$.reset(a);

			$.template_effect(
				($0) => {
					$.set_class(a, 1, $0);
					$.set_attribute(a, 'href', $$props.href);
				},
				[
					() => $.clsx($.get(base)({
						home: true,
						class: clsx($.get(theme)?.base, $$props.homeClass)
					}))
				]
			);

			$.append($$anchor, a);
		};

		var alternate_3 = ($$anchor) => {
			var fragment_1 = root_5();
			var node_4 = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_5 = $.first_child(fragment_2);

					$.snippet(node_5, () => $$props.icon);
					$.append($$anchor, fragment_2);
				};

				var alternate_1 = ($$anchor) => {
					var svg_1 = root_2();

					$.template_effect(($0) => $.set_class(svg_1, 0, $0), [
						() => $.clsx($.get(separator)({
							class: clsx($.get(theme)?.separator, $.get(styling).separator)
						}))
					]);

					$.append($$anchor, svg_1);
				};

				$.if(node_4, ($$render) => {
					if ($$props.icon) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			var node_6 = $.sibling(node_4, 2);

			{
				var consequent_3 = ($$anchor) => {
					var a_1 = root_3();
					var node_7 = $.child(a_1);

					$.snippet(node_7, () => $$props.children);
					$.reset(a_1);

					$.template_effect(
						($0) => {
							$.set_class(a_1, 1, $0);
							$.set_attribute(a_1, 'href', $$props.href);
						},
						[
							() => $.clsx($.get(base)({
								home: false,
								hasHref: true,
								class: clsx($.get(theme)?.base, $$props.linkClass)
							}))
						]
					);

					$.append($$anchor, a_1);
				};

				var alternate_2 = ($$anchor) => {
					var span = root_4();
					var node_8 = $.child(span);

					$.snippet(node_8, () => $$props.children);
					$.reset(span);

					$.template_effect(($0) => $.set_class(span, 1, $0), [
						() => $.clsx($.get(base)({
							home: false,
							hasHref: false,
							class: clsx($.get(theme)?.base, $$props.spanClass)
						}))
					]);

					$.append($$anchor, span);
				};

				$.if(node_6, ($$render) => {
					if ($$props.href) $$render(consequent_3); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (home()) $$render(consequent_1); else $$render(alternate_3, -1);
		});
	}

	$.reset(li);
	$.append($$anchor, li);
	$.pop();
}