import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { img } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'size',
	'effect',
	'align',
	'caption',
	'class',
	'classes',
	'figClass',
	'captionClass',
	'href'
]);

var root = $.from_html(`<img/>`);
var root_1 = $.from_html(`<figure><!> <figcaption></figcaption></figure>`);
var root_2 = $.from_html(`<a><!></a>`);

export default function Img($$anchor, $$props) {
	$.push($$props, true);

	const // Determine if using slot or traditional props
	// Compute the final class string to pass to children
	imageSlot = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_1 = ($$anchor) => {
				var figure_1 = root_1();
				var node_1 = $.child(figure_1);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ class: $.get(imgClass), restProps }));
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var img_1 = root();

						$.attribute_effect(img_1, () => ({ ...restProps, class: $.get(imgClass) }));
						$.replay_events(img_1);
						$.append($$anchor, img_1);
					};

					$.if(node_1, ($$render) => {
						if ($.get(useSlot)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				var figcaption = $.sibling(node_1, 2);

				$.html(figcaption, () => $$props.caption, true);
				$.reset(figcaption);
				$.reset(figure_1);

				$.template_effect(
					($0, $1) => {
						$.set_class(figure_1, 1, $0);
						$.set_class(figcaption, 1, $1);
					},
					[
						() => $.clsx($.get(figure)({ class: clsx($.get(theme)?.figure, $.get(styling).figure) })),
						() => $.clsx($.get(figureCaption)({ class: clsx($.get(theme)?.caption, $.get(styling).caption) }))
					]
				);

				$.append($$anchor, figure_1);
			};

			var consequent_2 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.snippet(node_3, () => $$props.children ?? $.noop, () => ({ class: $.get(imgClass), restProps }));
				$.append($$anchor, fragment_2);
			};

			var alternate_1 = ($$anchor) => {
				var img_2 = root();

				$.attribute_effect(img_2, () => ({ ...restProps, class: $.get(imgClass) }));
				$.replay_events(img_2);
				$.append($$anchor, img_2);
			};

			$.if(node, ($$render) => {
				if ($$props.caption) $$render(consequent_1); else if ($.get(useSlot)) $$render(consequent_2, 1); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Img",
		untrack(() => ({
			figClass: $$props.figClass,
			captionClass: $$props.captionClass
		})),
		{ figClass: "figure", captionClass: "caption" }
	);

	const styling = $.derived(() => ({
		figure: $$props.figClass || $$props.classes?.figure,
		caption: $$props.captionClass || $$props.classes?.caption
	}));

	const theme = $.derived(() => getTheme("img"));

	let $$d = $.derived(() => img({
			size: $$props.size,
			effect: $$props.effect,
			align: $$props.align
		})),
		base = $.derived(() => $.get($$d).base),
		figure = $.derived(() => $.get($$d).figure),
		figureCaption = $.derived(() => $.get($$d).caption);

	const useSlot = $.derived(() => !!$$props.children);
	const imgClass = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));
	var fragment_3 = $.comment();
	var node_4 = $.first_child(fragment_3);

	{
		var consequent_3 = ($$anchor) => {
			var a = root_2();
			var node_5 = $.child(a);

			imageSlot(node_5);
			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', $$props.href));
			$.append($$anchor, a);
		};

		var alternate_2 = ($$anchor) => {
			imageSlot($$anchor);
		};

		$.if(node_4, ($$render) => {
			if ($$props.href) $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment_3);
	$.pop();
}