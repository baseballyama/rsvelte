import * as $ from 'svelte/internal/server';
import { resolveIcon } from '$lib/assets';
import icons from '$lib/icons.svg';
import { getContext, hasContext } from 'svelte';
import { mode } from 'mode-watcher';
import { colorLikeToColor } from '$lib/props/color';

export default function Icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { icon, class: className, assetsPath: propAssetsPath } = $$props;

		const assetsPath = $.derived(propAssetsPath
			? () => propAssetsPath
			: hasContext('assetsPath') ? getContext('assetsPath') : () => '');

		const iconInfo = $.derived(() => resolveIcon(icon, assetsPath()));

		const style = $.derived(() => {
			if (!iconInfo()) return '';

			let styles = '';

			if (iconInfo().type === 'image' && iconInfo().mask) {
				if (iconInfo().mask === 'circle') {
					styles += 'border-radius: 50%;';
				} else if (iconInfo().mask === 'roundedRectangle') {
					styles += 'border-radius: 0.375rem;';
				}
			}

			if ('tintColor' in iconInfo() && iconInfo().tintColor) {
				const color = colorLikeToColor(iconInfo().tintColor, mode.current === 'dark');

				if (iconInfo().type === 'raycast') {
					return `color: ${color};`;
				}

				if (iconInfo().type === 'image') {
					styles += ` background-color: ${color}; -webkit-mask-image: url(${iconInfo().src}); mask-image: url(${iconInfo().src}); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center;`;
				}
			}

			return styles;
		});

		if (iconInfo()) {
			$$renderer.push('<!--[0-->');

			if (iconInfo().type === 'raycast') {
				$$renderer.push(`<!--[0--><svg${$.attr_class(`size-4 shrink-0 fill-none ${$.stringify(className ?? '')}`)}${$.attr_style(style())}><use${$.attr('href', `${$.stringify(icons)}#${$.stringify(iconInfo().name)}`)}></use></svg>`);
			} else if (iconInfo().type === 'image') {
				$$renderer.push('<!--[1-->');

				if (iconInfo().tintColor) {
					$$renderer.push(`<!--[0--><div${$.attr_class(`size-4 shrink-0 ${$.stringify(className ?? '')}`)}${$.attr_style(style())}></div>`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attr('src', iconInfo().src)} alt=""${$.attr_class(`size-4 shrink-0 object-contain ${$.stringify(className ?? '')}`)}${$.attr_style(style())}/>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (iconInfo().type === 'emoji') {
				$$renderer.push(`<!--[2--><span${$.attr_class(`shrink-0 ${$.stringify(className ?? '')}`)}>${$.escape(iconInfo().emoji)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}