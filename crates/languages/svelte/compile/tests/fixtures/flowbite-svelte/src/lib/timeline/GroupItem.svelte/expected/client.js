import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { groupItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'timelines',
	'aClass',
	'imgClass',
	'divClass',
	'titleClass',
	'spanClass',
	'class',
	'classes'
]);

var root = $.from_html(`<div class="text-sm font-normal"> </div>`);
var root_1 = $.from_svg(`<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"></path></svg> Private`, 1);
var root_2 = $.from_svg(`<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path></svg> Public`, 1);
var root_3 = $.from_html(`<li><a><img/> <div><div></div> <!> <span><!></span></div></a></li>`);

export default function GroupItem($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"GroupItem",
		untrack(() => ({
			aClass: $$props.aClass,
			imgClass: $$props.imgClass,
			divClass: $$props.divClass,
			titleClass: $$props.titleClass,
			spanClass: $$props.spanClass
		})),
		{
			aClass: "class",
			imgClass: "img",
			divClass: "div",
			titleClass: "title",
			spanClass: "span"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		img: $$props.imgClass,
		div: $$props.divClass,
		title: $$props.titleClass,
		span: $$props.spanClass,
		a: $$props.aClass
	});

	const theme = $.derived(() => getTheme("groupItem"));

	const $$d = $.derived(groupItem),
		base = $.derived(() => $.get($$d).base),
		a = $.derived(() => $.get($$d).a),
		img = $.derived(() => $.get($$d).img),
		div = $.derived(() => $.get($$d).div),
		title = $.derived(() => $.get($$d).title),
		span = $.derived(() => $.get($$d).span),
		svg = $.derived(() => $.get($$d).svg);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 19, () => $$props.timelines, ({ name, src, alt, isPrivate, href, comment, id }, index) => id ?? href ?? name ?? index, ($$anchor, $$item) => {
		let name = () => $.get($$item).name;
		let src = () => $.get($$item).src;
		let alt = () => $.get($$item).alt;
		let isPrivate = () => $.get($$item).isPrivate;
		let href = () => $.get($$item).href;
		let comment = () => $.get($$item).comment;
		let id = () => $.get($$item).id;
		var li = root_3();

		$.attribute_effect(li, ($0) => ({ class: $0, ...restProps }), [
			() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
		]);

		var a_1 = $.child(li);
		var img_1 = $.child(a_1);
		var div_1 = $.sibling(img_1, 2);
		var div_2 = $.child(div_1);

		$.html(div_2, name, true);
		$.reset(div_2);

		var node_1 = $.sibling(div_2, 2);

		{
			var consequent = ($$anchor) => {
				var div_3 = root();
				var text = $.only_child(div_3, true);

				$.template_effect(() => $.set_text(text, comment()));
				$.append($$anchor, div_3);
			};

			$.if(node_1, ($$render) => {
				if (comment()) $$render(consequent);
			});
		}

		var span_1 = $.sibling(node_1, 2);
		var node_2 = $.child(span_1);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_1 = root_1();
				var svg_1 = $.first_child(fragment_1);

				$.next();

				$.template_effect(($0) => $.set_class(svg_1, 0, $0), [
					() => $.clsx($.get(svg)({ class: clsx($.get(theme)?.svg, $$props.classes?.svg) }))
				]);

				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var fragment_2 = root_2();
				var svg_2 = $.first_child(fragment_2);

				$.next();

				$.template_effect(($0) => $.set_class(svg_2, 0, $0), [
					() => $.clsx($.get(svg)({ class: clsx($.get(theme)?.svg, $$props.classes?.svg) }))
				]);

				$.append($$anchor, fragment_2);
			};

			$.if(node_2, ($$render) => {
				if (isPrivate()) $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.reset(span_1);
		$.reset(div_1);
		$.reset(a_1);
		$.reset(li);

		$.template_effect(
			($0, $1, $2, $3, $4) => {
				$.set_attribute(a_1, 'href', href());
				$.set_class(a_1, 1, $0);
				$.set_class(img_1, 1, $1);
				$.set_attribute(img_1, 'src', src());
				$.set_attribute(img_1, 'alt', alt());
				$.set_class(div_1, 1, $2);
				$.set_class(div_2, 1, $3);
				$.set_class(span_1, 1, $4);
			},
			[
				() => $.clsx($.get(a)({ class: clsx($.get(theme)?.a, $.get(styling).a) })),
				() => $.clsx($.get(img)({ class: clsx($.get(theme)?.img, $.get(styling).img) })),
				() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $.get(styling).div) })),
				() => $.clsx($.get(title)({ class: clsx($.get(theme)?.title, $.get(styling).title) })),
				() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) }))
			]
		);

		$.append($$anchor, li);
	});

	$.append($$anchor, fragment);
	$.pop();
}