import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { avatar } from "./theme";
import clsx from "clsx";
import Indicator from "$lib/indicator/Indicator.svelte";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'indicator',
	'src',
	'href',
	'target',
	'cornerStyle',
	'border',
	'stacked',
	'dot',
	'class',
	'alt',
	'size',
	'onclick'
]);

var root = $.from_html(`<img/>`);
var root_1 = $.from_svg(`<svg fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Avatar($$anchor, $$props) {
	$.push($$props, true);

	let cornerStyle = $.prop($$props, 'cornerStyle', 3, "circular"),
		border = $.prop($$props, 'border', 3, false),
		stacked = $.prop($$props, 'stacked', 3, false),
		size = $.prop($$props, 'size', 3, "md"),
		restProps = $.rest_props($$props, rest_excludes);

	// Theme context
	const theme = $.derived(() => getTheme("avatar"));

	let dotProps = $.derived(() => $$props.dot
		? {
			placement: "top-right",
			color: "gray",
			size: "lg",
			...$$props.dot
		}
		: undefined);

	let avatarClass = $.derived(() => avatar({
		cornerStyle: cornerStyle(),
		border: border(),
		stacked: stacked(),
		size: size(),
		class: clsx($.get(theme), $$props.class)
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.element(node_1, () => $$props.href ? "a" : "div", false, ($$element, $$anchor) => {
				$.attribute_effect($$element, () => ({
					role: $$props.href ? undefined : "button",
					onclick: $$props.onclick,
					href: $$props.href,
					target: $$props.target,
					...restProps,
					class: $.get(avatarClass)
				}));

				var fragment_2 = root_2();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var img = root();

						$.template_effect(() => {
							$.set_attribute(img, 'alt', $$props.alt);
							$.set_attribute(img, 'src', $$props.src);
							$.set_class(img, 1, $.clsx(cornerStyle() === "circular" ? "rounded-full" : "rounded-sm"));
						});

						$.append($$anchor, img);
					};

					var consequent_1 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.children);
						$.append($$anchor, fragment_3);
					};

					var alternate = ($$anchor) => {
						var svg = root_1();

						$.template_effect(() => $.set_class(svg, 0, `h-full w-full ${cornerStyle() === 'circular' ? 'rounded-full' : 'rounded-sm'}`));
						$.append($$anchor, svg);
					};

					$.if(node_2, ($$render) => {
						if ($$props.src) $$render(consequent); else if ($$props.children) $$render(consequent_1, 1); else $$render(alternate, -1);
					});
				}

				var node_4 = $.sibling(node_2, 2);

				{
					var consequent_2 = ($$anchor) => {
						{
							let $0 = $.derived(() => cornerStyle() === "circular" ? true : false);

							Indicator($$anchor, $.spread_props(
								{
									border: true,
									get offset() {
										return $.get($0);
									}
								},
								() => $.get(dotProps)
							));
						}
					};

					$.if(node_4, ($$render) => {
						if ($.get(dotProps)) $$render(consequent_2);
					});
				}

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_6 = $.first_child(fragment_5);

						$.snippet(node_6, () => $$props.indicator);
						$.append($$anchor, fragment_5);
					};

					$.if(node_5, ($$render) => {
						if ($$props.indicator) $$render(consequent_3);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var img_1 = root();

			$.attribute_effect(img_1, () => ({
				alt: $$props.alt,
				src: $$props.src,
				...restProps,
				onclick: $$props.onclick,
				class: $.get(avatarClass)
			}));

			$.replay_events(img_1);
			$.append($$anchor, img_1);
		};

		$.if(node, ($$render) => {
			if (!$$props.src || !!$$props.href || $$props.children || $$props.dot || $$props.indicator) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}