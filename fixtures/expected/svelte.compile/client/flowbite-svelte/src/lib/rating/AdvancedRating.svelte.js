import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { advancedRating } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var root = $.from_html(`<div><span> </span> <div><div></div></div> <span> </span></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function AdvancedRating($$anchor, $$props) {
	$.push($$props, true);

	warnThemeDeprecation(
		"AdvancedRating",
		untrack(() => ({
			divClass: $$props.divClass,
			spanClass: $$props.spanClass,
			div2Class: $$props.div2Class,
			div3Class: $$props.div3Class,
			span2Class: $$props.span2Class
		})),
		{
			divClass: "class",
			spanClass: "span",
			div2Class: "div2",
			div3Class: "div3",
			span2Class: "span2"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		span: $$props.spanClass,
		div2: $$props.div2Class,
		div3: $$props.div3Class,
		span2: $$props.span2Class
	});

	const theme = $.derived(() => getTheme("advancedRating"));

	const $$d = $.derived(advancedRating),
		base = $.derived(() => $.get($$d).base),
		span = $.derived(() => $.get($$d).span),
		div2 = $.derived(() => $.get($$d).div2),
		div3 = $.derived(() => $.get($$d).div3),
		span2 = $.derived(() => $.get($$d).span2);

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.rating);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.rating) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.globalText);
			$.append($$anchor, fragment_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.globalText) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	$.each(node_4, 19, () => $$props.ratings, ({ label, rating }, i) => label ?? i, ($$anchor, $$item, i, $$array) => {
		let label = () => $.get($$item).label;
		let rating = () => $.get($$item).rating;
		var div = root();
		var span_1 = $.child(div);
		var text = $.only_child(span_1, true);
		var div_1 = $.sibling(span_1, 2);
		var div_2 = $.only_child(div_1);
		var span_2 = $.sibling(div_1, 2);
		var text_1 = $.only_child(span_2);

		$.reset(div);

		$.template_effect(
			($0, $1, $2, $3, $4) => {
				$.set_class(div, 1, $0);
				$.set_class(span_1, 1, $1);
				$.set_text(text, label());
				$.set_class(div_1, 1, $2);
				$.set_class(div_2, 1, $3);
				$.set_style(div_2, `width: ${rating() ?? ''}%`);
				$.set_class(span_2, 1, $4);
				$.set_text(text_1, `${rating() ?? ''}${$$props.unit ?? ''}`);
			},
			[
				() => $.clsx($.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })),
				() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) })),
				() => $.clsx($.get(div2)({ class: clsx($.get(theme)?.div2, $.get(styling).div2) })),
				() => $.clsx($.get(div3)({ class: clsx($.get(theme)?.div3, $.get(styling).div3) })),
				() => $.clsx($.get(span2)({ class: clsx($.get(theme)?.span2, $.get(styling).span2) }))
			]
		);

		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}