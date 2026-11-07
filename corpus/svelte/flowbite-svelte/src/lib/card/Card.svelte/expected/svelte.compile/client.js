import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { card } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'horizontal',
	'shadow',
	'reverse',
	'img',
	'size',
	'class',
	'classes',
	'imgClass'
]);

var root = $.from_html(`<img alt="" loading="lazy"/> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<a><!></a>`);

export default function Card($$anchor, $$props) {
	$.push($$props, true);

	const childSlot = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var img_1 = $.first_child(fragment_1);
				var node_1 = $.sibling(img_1, 2);

				$.snippet(node_1, () => $$props.children ?? $.noop);

				$.template_effect(
					($0) => {
						$.set_class(img_1, 1, $0);
						$.set_attribute(img_1, 'src', $$props.img);
					},
					[
						() => $.clsx($.get(image)({ class: clsx($.get(theme)?.image, $.get(styling).image) }))
					]
				);

				$.event('error', img_1, (e) => {
					const target = e.currentTarget;

					if (target) {
						target.style.display = "none";
					}
				});

				$.replay_events(img_1);
				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_2);
			};

			$.if(node, ($$render) => {
				if ($$props.img) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let color = $.prop($$props, 'color', 3, "gray"),
		horizontal = $.prop($$props, 'horizontal', 3, false),
		shadow = $.prop($$props, 'shadow', 3, "md"),
		reverse = $.prop($$props, 'reverse', 3, false),
		size = $.prop($$props, 'size', 3, "sm"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Card", untrack(() => ({ imgClass: $$props.imgClass })), { imgClass: "image" });

	const styling = $.derived(() => $$props.classes ?? { image: $$props.imgClass });
	const theme = $.derived(() => getTheme("card"));

	const $$d = $.derived(() => card({
			size: size(),
			color: color(),
			shadow: shadow(),
			horizontal: horizontal(),
			reverse: reverse(),
			href: !!$$props.href
		})),
		base = $.derived(() => $.get($$d).base),
		image = $.derived(() => $.get($$d).image);

	var fragment_3 = $.comment();
	var node_3 = $.first_child(fragment_3);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			var node_4 = $.child(div);

			childSlot(node_4);
			$.reset(div);
			$.append($$anchor, div);
		};

		var alternate_1 = ($$anchor) => {
			var a = root_2();

			$.attribute_effect(a, ($0) => ({ ...restProps, class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			var node_5 = $.child(a);

			childSlot(node_5);
			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node_3, ($$render) => {
			if ($$props.href === undefined) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment_3);
	$.pop();
}