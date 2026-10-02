import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scoreRating } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<span></span> <p> </p>`, 1);
var root_2 = $.from_html(`<a> </a>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<dl><dt class="text-sm font-medium text-gray-500 dark:text-gray-400"> </dt> <dd class="mb-3 flex items-center"><div class="me-2 h-2.5 w-full rounded-sm bg-gray-200 dark:bg-gray-700"><div></div></div> <span class="text-sm font-medium text-gray-500 dark:text-gray-400"> </span></dd></dl>`);
var root_5 = $.from_html(`<div class="mb-5 flex items-center"><!></div> <div class="gap-8 sm:grid sm:grid-cols-2"><div><!></div> <div><!></div></div>`, 1);

export default function ScoreRating($$anchor, $$props) {
	$.push($$props, true);

	const theme = $.derived(() => getTheme("scoreRating"));

	const $$d = $.derived(scoreRating),
		desc1 = $.derived(() => $.get($$d).desc1),
		desc2 = $.derived(() => $.get($$d).desc2),
		desc3span = $.derived(() => $.get($$d).desc3span),
		desc3p = $.derived(() => $.get($$d).desc3p),
		link = $.derived(() => $.get($$d).link),
		bar = $.derived(() => $.get($$d).bar);

	var fragment = root_5();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_3();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var text = $.only_child(p, true);

					$.template_effect(
						($0) => {
							$.set_class(p, 1, $0);
							$.set_text(text, $$props.headerLabel.desc1);
						},
						[
							() => $.clsx($.get(desc1)({ class: clsx($.get(theme)?.desc1, $$props.classes?.desc1) }))
						]
					);

					$.append($$anchor, p);
				};

				$.if(node_1, ($$render) => {
					if ($$props.headerLabel.desc1) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p_1 = root();
					var text_1 = $.only_child(p_1, true);

					$.template_effect(
						($0) => {
							$.set_class(p_1, 1, $0);
							$.set_text(text_1, $$props.headerLabel.desc2);
						},
						[
							() => $.clsx($.get(desc2)({ class: clsx($.get(theme)?.desc2, $$props.classes?.desc2) }))
						]
					);

					$.append($$anchor, p_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.headerLabel.desc2) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = root_1();
					var span = $.first_child(fragment_2);
					var p_2 = $.sibling(span, 2);
					var text_2 = $.only_child(p_2, true);

					$.template_effect(
						($0, $1) => {
							$.set_class(span, 1, $0);
							$.set_class(p_2, 1, $1);
							$.set_text(text_2, $$props.headerLabel.desc3);
						},
						[
							() => $.clsx($.get(desc3span)({
								class: clsx($.get(theme)?.desc3span, $$props.classes?.desc3span)
							})),
							() => $.clsx($.get(desc3p)({ class: clsx($.get(theme)?.desc3p, $$props.classes?.desc3p) }))
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.headerLabel.desc3) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					var a = root_2();
					var text_3 = $.only_child(a, true);

					$.template_effect(
						($0) => {
							$.set_attribute(a, 'href', $$props.headerLabel.link.url);
							$.set_class(a, 1, $0);
							$.set_text(text_3, $$props.headerLabel.link.label);
						},
						[
							() => $.clsx($.get(link)({ class: clsx($.get(theme)?.link, $$props.classes?.link) }))
						]
					);

					$.append($$anchor, a);
				};

				$.if(node_4, ($$render) => {
					if ($$props.headerLabel.link) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.headerLabel) $$render(consequent_4);
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var node_5 = $.child(div_2);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			$.each(node_6, 17, () => $$props.ratings, ({ label, rating }) => label, ($$anchor, $$item) => {
				let label = () => $.get($$item).label;
				let rating = () => $.get($$item).rating;
				var dl = root_4();
				var dt = $.child(dl);
				var text_4 = $.only_child(dt, true);
				var dd = $.sibling(dt, 2);
				var div_3 = $.child(dd);
				var div_4 = $.only_child(div_3);
				var span_1 = $.sibling(div_3, 2);
				var text_5 = $.only_child(span_1, true);

				$.reset(dd);
				$.reset(dl);

				$.template_effect(
					($0) => {
						$.set_text(text_4, label());
						$.set_class(div_4, 1, $0);
						$.set_style(div_4, `width: ${rating() * 10}%`);
						$.set_text(text_5, rating());
					},
					[
						() => $.clsx($.get(bar)({ class: clsx($.get(theme)?.bar, $$props.classes?.bar) }))
					]
				);

				$.append($$anchor, dl);
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_5, ($$render) => {
			if ($$props.ratings) $$render(consequent_5);
		});
	}

	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var node_7 = $.child(div_5);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_8 = $.first_child(fragment_4);

			$.each(node_8, 17, () => $$props.ratings2, ({ label, rating }) => label, ($$anchor, $$item) => {
				let label = () => $.get($$item).label;
				let rating = () => $.get($$item).rating;
				var dl_1 = root_4();
				var dt_1 = $.child(dl_1);
				var text_6 = $.only_child(dt_1, true);
				var dd_1 = $.sibling(dt_1, 2);
				var div_6 = $.child(dd_1);
				var div_7 = $.only_child(div_6);
				var span_2 = $.sibling(div_6, 2);
				var text_7 = $.only_child(span_2, true);

				$.reset(dd_1);
				$.reset(dl_1);

				$.template_effect(
					($0) => {
						$.set_text(text_6, label());
						$.set_class(div_7, 1, $0);
						$.set_style(div_7, `width: ${rating() * 10}%`);
						$.set_text(text_7, rating());
					},
					[
						() => $.clsx($.get(bar)({ class: clsx($.get(theme)?.bar, $$props.classes?.bar) }))
					]
				);

				$.append($$anchor, dl_1);
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_7, ($$render) => {
			if ($$props.ratings2) $$render(consequent_6);
		});
	}

	$.reset(div_5);
	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}