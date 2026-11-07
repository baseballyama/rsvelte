import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolveIcon } from '$lib/assets';
import icons from '$lib/icons.svg';
import { getContext, hasContext } from 'svelte';
import { mode } from 'mode-watcher';
import { colorLikeToColor } from '$lib/props/color';

var root = $.from_svg(`<svg><use></use></svg>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<img alt=""/>`);
var root_3 = $.from_html(`<span> </span>`);

export default function Icon($$anchor, $$props) {
	$.push($$props, true);

	const assetsPath = $.derived($$props.assetsPath
		? () => $$props.assetsPath
		: hasContext('assetsPath') ? getContext('assetsPath') : () => '');

	const iconInfo = $.derived(() => resolveIcon($$props.icon, $.get(assetsPath)));

	const style = $.derived(() => {
		if (!$.get(iconInfo)) return '';

		let styles = '';

		if ($.get(iconInfo).type === 'image' && $.get(iconInfo).mask) {
			if ($.get(iconInfo).mask === 'circle') {
				styles += 'border-radius: 50%;';
			} else if ($.get(iconInfo).mask === 'roundedRectangle') {
				styles += 'border-radius: 0.375rem;';
			}
		}

		if ('tintColor' in $.get(iconInfo) && $.get(iconInfo).tintColor) {
			const color = colorLikeToColor($.get(iconInfo).tintColor, mode.current === 'dark');

			if ($.get(iconInfo).type === 'raycast') {
				return `color: ${color};`;
			}

			if ($.get(iconInfo).type === 'image') {
				styles += ` background-color: ${color}; -webkit-mask-image: url(${$.get(iconInfo).src}); mask-image: url(${$.get(iconInfo).src}); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;`;
			}
		}

		return styles;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var svg = root();
					var use = $.only_child(svg);

					$.template_effect(() => {
						$.set_class(svg, 0, `size-4 shrink-0 fill-none ${$$props.class ?? '' ?? ''}`);
						$.set_style(svg, $.get(style));
						$.set_attribute(use, 'href', `${icons ?? ''}#${$.get(iconInfo).name ?? ''}`);
					});

					$.append($$anchor, svg);
				};

				var consequent_2 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent_1 = ($$anchor) => {
							var div = root_1();

							$.template_effect(() => {
								$.set_class(div, 1, `size-4 shrink-0 ${$$props.class ?? '' ?? ''}`);
								$.set_style(div, $.get(style));
							});

							$.append($$anchor, div);
						};

						var alternate = ($$anchor) => {
							var img = root_2();

							$.template_effect(() => {
								$.set_attribute(img, 'src', $.get(iconInfo).src);
								$.set_class(img, 1, `size-4 shrink-0 object-contain ${$$props.class ?? '' ?? ''}`);
								$.set_style(img, $.get(style));
							});

							$.append($$anchor, img);
						};

						$.if(node_2, ($$render) => {
							if ($.get(iconInfo).tintColor) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				var consequent_3 = ($$anchor) => {
					var span = root_3();
					var text = $.only_child(span, true);

					$.template_effect(() => {
						$.set_class(span, 1, `shrink-0 ${$$props.class ?? '' ?? ''}`);
						$.set_text(text, $.get(iconInfo).emoji);
					});

					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if ($.get(iconInfo).type === 'raycast') $$render(consequent); else if ($.get(iconInfo).type === 'image') $$render(consequent_2, 1); else if ($.get(iconInfo).type === 'emoji') $$render(consequent_3, 2);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(iconInfo)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}