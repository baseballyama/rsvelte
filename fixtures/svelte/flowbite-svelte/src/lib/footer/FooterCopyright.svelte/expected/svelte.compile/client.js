import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteDate } from "svelte/reactivity";
import { footerCopyright } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'spanClass',
	'aClass',
	'href',
	'by',
	'copyrightMessage',
	'year',
	'bySpanClass',
	'classes',
	'class'
]);

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<span> <!> </span>`);

export default function FooterCopyright($$anchor, $$props) {
	$.push($$props, true);

	let copyrightMessage = $.prop($$props, 'copyrightMessage', 3, "All Rights Reserved."),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"FooterCopyright",
		untrack(() => ({
			aClass: $$props.aClass,
			spanClass: $$props.spanClass,
			bySpanClass: $$props.bySpanClass
		})),
		{ aClass: "link", spanClass: "class", bySpanClass: "bySpan" }
	);

	// link, bySpan
	const styling = $.derived(() => $$props.classes ?? { bySpan: $$props.bySpanClass, link: $$props.aClass });

	const theme = $.derived(() => getTheme("footerCopyright"));
	const effectiveYear = $.derived(() => $$props.year ?? new SvelteDate().getFullYear());
	const { base, link, bySpan } = footerCopyright();
	var span = root_2();
	var text = $.child(span);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var a = root();

			$.attribute_effect(a, ($0) => ({ ...restProps, href: $$props.href, class: $0 }), [
				() => link({ class: clsx($.get(theme)?.link, $.get(styling).link) })
			]);

			var text_1 = $.only_child(a, true);

			$.template_effect(() => $.set_text(text_1, $$props.by));
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var span_1 = root_1();
			var text_2 = $.only_child(span_1, true);

			$.template_effect(
				($0) => {
					$.set_class(span_1, 1, $0);
					$.set_text(text_2, $$props.by);
				},
				[
					() => $.clsx(bySpan({ class: clsx($.get(theme)?.bySpan, $.get(styling).bySpan) }))
				]
			);

			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($$props.href) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var text_3 = $.sibling(node);

	$.reset(span);

	$.template_effect(
		($0) => {
			$.set_class(span, 1, $0);
			$.set_text(text, `© ${$.get(effectiveYear) ?? ''} `);
			$.set_text(text_3, ` ${copyrightMessage() ?? ''}`);
		},
		[
			() => $.clsx(base({
				class: clsx($.get(theme)?.base, $$props.class ?? $$props.spanClass)
			}))
		]
	);

	$.append($$anchor, span);
	$.pop();
}