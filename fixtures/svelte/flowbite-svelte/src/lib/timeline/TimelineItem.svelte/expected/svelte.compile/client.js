import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, untrack } from "svelte";
import { timelineItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'orientationSlot',
	'title',
	'date',
	'dateFormat',
	'color',
	'isLast',
	'svgClass',
	'liClass',
	'defaultDivClass',
	'divClass',
	'timeClass',
	'h3Class',
	'connectorClass',
	'datePrefix',
	'class',
	'classes'
]);

var root = $.from_html(`<div aria-hidden="true"></div>`);
var root_1 = $.from_html(`<div><svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg></div>`);
var root_2 = $.from_html(`<div aria-hidden="true"></div> <time> </time>`, 1);
var root_3 = $.from_html(`<h3> </h3>`);
var root_4 = $.from_html(`<time> </time>`);
var root_5 = $.from_html(`<li><!> <!> <!> <!> <!></li>`);

export default function TimelineItem($$anchor, $$props) {
	$.push($$props, true);

	let dateFormat = $.prop($$props, 'dateFormat', 3, "month-year"),
		color = $.prop($$props, 'color', 3, "primary"),
		isLast = $.prop($$props, 'isLast', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"TimelineItem",
		untrack(() => ({
			svgClass: $$props.svgClass,
			liClass: $$props.liClass,
			divClass: $$props.divClass,
			timeClass: $$props.timeClass,
			h3Class: $$props.h3Class,
			connectorClass: $$props.connectorClass
		})),
		{
			liClass: "class",
			svgClass: "svg",
			divClass: "div",
			timeClass: "time",
			h3Class: "h3",
			connectorClass: "connector"
		}
	);

	const styling = $.derived(() => ({
		svg: $$props.svgClass,
		div: $$props.divClass,
		time: $$props.timeClass,
		h3: $$props.h3Class,
		connector: $$props.connectorClass
	}));

	const theme = $.derived(() => getTheme("timelineItem"));
	let order = getContext("order");

	const $$d = $.derived(() => timelineItem({ order, color: color(), isLast: isLast() })),
		base = $.derived(() => $.get($$d).base),
		div = $.derived(() => $.get($$d).div),
		defaultDiv = $.derived(() => $.get($$d).defaultDiv),
		time = $.derived(() => $.get($$d).time),
		h3 = $.derived(() => $.get($$d).h3),
		svg = $.derived(() => $.get($$d).svg),
		connector = $.derived(() => $.get($$d).connector);

	const defaultDivCls = $.derived(() => $$props.defaultDivClass ? $$props.defaultDivClass : $.get(defaultDiv)());

	function formatDisplayDate(dateStr, format) {
		const date = new Date(dateStr);

		if (isNaN(date.getTime())) return dateStr;

		switch (format) {
			case "year":
				return date.toLocaleDateString(undefined, { year: "numeric" });

			case "month-year":
				return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

			case "full-date":
				return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

			default:
				return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
		}
	}

	var li = root_5();

	$.attribute_effect(li, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({
			class: clsx($.get(theme)?.base, $$props.class ?? $$props.liClass)
		})
	]);

	var node = $.child(li);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.template_effect(($0) => $.set_class(div_1, 1, $0), [
				() => $.clsx($.get(connector)({
					class: clsx($.get(theme)?.connector, $.get(styling).connector)
				}))
			]);

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!isLast() && (order === "vertical" || order === "activity")) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.snippet(node_3, () => $$props.orientationSlot);
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var div_2 = root_1();
					var svg_1 = $.only_child(div_2);

					$.template_effect(
						($0, $1) => {
							$.set_class(div_2, 1, $0);
							$.set_class(svg_1, 0, $1);
						},
						[
							() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $.get(styling).div) })),
							() => $.clsx($.get(svg)({ class: clsx($.get(theme)?.svg, $.get(styling).svg) }))
						]
					);

					$.append($$anchor, div_2);
				};

				$.if(node_2, ($$render) => {
					if ($$props.orientationSlot && (order === "vertical" || order === "horizontal")) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		var consequent_3 = ($$anchor) => {
			var fragment_2 = root_2();
			var div_3 = $.first_child(fragment_2);
			var time_1 = $.sibling(div_3, 2);
			var text = $.only_child(time_1);

			$.template_effect(
				($0, $1) => {
					$.set_class(div_3, 1, $.clsx($.get(defaultDivCls)));
					$.set_attribute(time_1, 'datetime', $$props.date);
					$.set_class(time_1, 1, $0);

					$.set_text(text, `${$$props.datePrefix ?? ''}
      ${$1 ?? ''}`);
				},
				[
					() => $.clsx($.get(time)({ class: clsx($.get(theme)?.time, $.get(styling).time) })),
					() => formatDisplayDate($$props.date, dateFormat())
				]
			);

			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if (order !== "default") $$render(consequent_2); else if ($$props.date) $$render(consequent_3, 1);
		});
	}

	var node_4 = $.sibling(node_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var h3_1 = root_3();
			var text_1 = $.only_child(h3_1, true);

			$.template_effect(
				($0) => {
					$.set_class(h3_1, 1, $0);
					$.set_text(text_1, $$props.title);
				},
				[
					() => $.clsx($.get(h3)({ class: clsx($.get(theme)?.h3, $.get(styling).h3) }))
				]
			);

			$.append($$anchor, h3_1);
		};

		$.if(node_4, ($$render) => {
			if ($$props.title) $$render(consequent_4);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			{
				var consequent_5 = ($$anchor) => {
					var time_2 = root_4();
					var text_2 = $.only_child(time_2);

					$.template_effect(
						($0, $1) => {
							$.set_attribute(time_2, 'datetime', $$props.date);
							$.set_class(time_2, 1, $0);

							$.set_text(text_2, `${$$props.datePrefix ?? ''}
        ${$1 ?? ''}`);
						},
						[
							() => $.clsx($.get(time)({ class: clsx($.get(theme)?.time, $.get(styling).time) })),
							() => formatDisplayDate($$props.date, dateFormat())
						]
					);

					$.append($$anchor, time_2);
				};

				$.if(node_6, ($$render) => {
					if ($$props.date) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node_5, ($$render) => {
			if (order !== "default") $$render(consequent_6);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	$.snippet(node_7, () => $$props.children);
	$.reset(li);
	$.append($$anchor, li);
	$.pop();
}