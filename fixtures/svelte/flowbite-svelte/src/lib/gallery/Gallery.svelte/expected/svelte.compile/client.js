import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gallery } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'figure',
	'items',
	'imgClass',
	'class',
	'classes'
]);

var root = $.from_html(`<div><img/></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function Gallery($$anchor, $$props) {
	$.push($$props, true);

	const _figure = ($$anchor, item = $.noop) => {
		var div_1 = root();
		var img = $.child(div_1);

		$.attribute_effect(img, ($0) => ({ src: item().src, alt: item().alt, class: $0, ...restProps }), [
			() => image({ class: clsx($.get(theme)?.image, $.get(styling).image) })
		]);

		$.reset(div_1);
		$.replay_events(img);
		$.append($$anchor, div_1);
	};

	let items = $.prop($$props, 'items', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Gallery", untrack(() => ({ imgClass: $$props.imgClass })), { imgClass: "image" });

	const styling = $.derived(() => $$props.classes ?? { image: $$props.imgClass });
	const theme = $.derived(() => getTheme("gallery"));

	function init(node) {
		if (getComputedStyle(node).gap === "normal") node.style.gap = "inherit";
	}

	const { image, div } = gallery();
	var div_2 = root_1();

	$.each(
		div_2,
		23,
		items,
		(item, i) => item.src || i,
		($$anchor, item) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.figure, () => $.get(item));
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					_figure($$anchor, () => $.get(item));
				};

				$.if(node_1, ($$render) => {
					if ($$props.figure) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		},
		($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					$.snippet(node_4, () => $$props.children);
					$.append($$anchor, fragment_4);
				};

				$.if(node_3, ($$render) => {
					if ($$props.children) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_3);
		}
	);

	$.reset(div_2);
	$.action(div_2, ($$node) => init?.($$node));

	$.template_effect(($0) => $.set_class(div_2, 1, $0), [
		() => $.clsx(div({ class: clsx($.get(theme)?.div, $$props.class) }))
	]);

	$.append($$anchor, div_2);
	$.pop();
}