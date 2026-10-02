import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { activityItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'activities',
	'liClass',
	'spanClass',
	'imgClass',
	'outerDivClass',
	'innerDivClass',
	'timeClass',
	'titleClass',
	'textClass',
	'class',
	'classes'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<li><span><img/></span> <div><div><time> </time> <div></div></div> <!></div></li>`);

export default function ActivityItem($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"ActivityItem",
		untrack(() => ({
			liClass: $$props.liClass,
			spanClass: $$props.spanClass,
			imgClass: $$props.imgClass,
			outerDivClass: $$props.outerDivClass,
			innerDivClass: $$props.innerDivClass,
			timeClass: $$props.timeClass,
			titleClass: $$props.titleClass,
			textClass: $$props.textClass
		})),
		{
			liClass: "class",
			spanClass: "span",
			imgClass: "img",
			outerDivClass: "outer",
			innerDivClass: "inner",
			timeClass: "time",
			titleClass: "title",
			textClass: "text"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		span: $$props.spanClass,
		img: $$props.imgClass,
		outer: $$props.outerDivClass,
		inner: $$props.innerDivClass,
		time: $$props.timeClass,
		title: $$props.titleClass,
		text: $$props.textClass
	});

	const theme = $.derived(() => getTheme("activityItem"));

	const $$d = $.derived(activityItem),
		li = $.derived(() => $.get($$d).li),
		span = $.derived(() => $.get($$d).span),
		img = $.derived(() => $.get($$d).img),
		outer = $.derived(() => $.get($$d).outer),
		inner = $.derived(() => $.get($$d).inner),
		time = $.derived(() => $.get($$d).time),
		title = $.derived(() => $.get($$d).title),
		text = $.derived(() => $.get($$d).text);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 19, () => $$props.activities, ({ title: name, date, src, alt, text: activity, id }, index) => id ?? src ?? index, ($$anchor, $$item) => {
		let name = () => $.get($$item).title;
		let date = () => $.get($$item).date;
		let src = () => $.get($$item).src;
		let alt = () => $.get($$item).alt;
		let activity = () => $.get($$item).text;
		let id = () => $.get($$item).id;
		var li_1 = root_1();

		$.attribute_effect(li_1, ($0) => ({ ...restProps, class: $0 }), [
			() => $.get(li)({
				class: clsx($.get(theme)?.li, $$props.class ?? $$props.liClass)
			})
		]);

		var span_1 = $.child(li_1);
		var img_1 = $.only_child(span_1);
		var div = $.sibling(span_1, 2);
		var div_1 = $.child(div);
		var time_1 = $.child(div_1);
		var text_1 = $.only_child(time_1, true);
		var div_2 = $.sibling(time_1, 2);

		$.html(div_2, name, true);
		$.reset(div_2);
		$.reset(div_1);

		var node_1 = $.sibling(div_1, 2);

		{
			var consequent = ($$anchor) => {
				var div_3 = root();

				$.html(div_3, activity, true);
				$.reset(div_3);

				$.template_effect(($0) => $.set_class(div_3, 1, $0), [
					() => $.clsx($.get(text)({ class: clsx($.get(theme)?.text, $.get(styling).text) }))
				]);

				$.append($$anchor, div_3);
			};

			$.if(node_1, ($$render) => {
				if (activity()) $$render(consequent);
			});
		}

		$.reset(div);
		$.reset(li_1);

		$.template_effect(
			($0, $1, $2, $3, $4, $5) => {
				$.set_class(span_1, 1, $0);
				$.set_class(img_1, 1, $1);
				$.set_attribute(img_1, 'src', src());
				$.set_attribute(img_1, 'alt', alt());
				$.set_class(div, 1, $2);
				$.set_class(div_1, 1, $3);
				$.set_class(time_1, 1, $4);
				$.set_text(text_1, date());
				$.set_class(div_2, 1, $5);
			},
			[
				() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) })),
				() => $.clsx($.get(img)({ class: clsx($.get(theme)?.img, $.get(styling).img) })),
				() => $.clsx($.get(outer)({ class: clsx($.get(theme)?.outer, $.get(styling).outer) })),
				() => $.clsx($.get(inner)({ class: clsx($.get(theme)?.inner, $.get(styling).inner) })),
				() => $.clsx($.get(time)({ class: clsx($.get(theme)?.time, $.get(styling).time) })),
				() => $.clsx($.get(title)({ class: clsx($.get(theme)?.title, $.get(styling).title) }))
			]
		);

		$.append($$anchor, li_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}