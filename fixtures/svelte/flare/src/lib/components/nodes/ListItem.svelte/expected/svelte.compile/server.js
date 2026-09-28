import * as $ from 'svelte/internal/server';
import ListItemBase from './shared/ListItemBase.svelte';
import Icon from '../Icon.svelte';
import { colorLikeToColor } from '$lib/props/color';
import { mode } from 'mode-watcher';

export default function ListItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { props, selected, $$slots, $$events, ...restProps } = $$props;

		function formatRelative(date) {
			const now = new Date();
			const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
			const diffMinutes = Math.round(diffSeconds / 60);
			const diffHours = Math.round(diffMinutes / 60);
			const diffDays = Math.round(diffHours / 24);
			const diffWeeks = Math.round(diffDays / 7);
			const diffMonths = Math.round(diffDays / 30.44);
			const diffYears = Math.round(diffDays / 365.25);

			if (diffSeconds < 60) return 'now';
			if (diffMinutes < 60) return `${diffMinutes}m`;
			if (diffHours < 24) return `${diffHours}h`;
			if (diffDays < 7) return `${diffDays}d`;
			if (diffWeeks < 5) return `${diffWeeks}w`;
			if (diffMonths < 12) return `${diffMonths}mo`;

			return `${diffYears}y`;
		}

		{
			function accessories($$renderer) {
				if (props.accessories && props.accessories.length > 0) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array = $.ensure_array_like(props.accessories ?? []);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let accessory = each_array[i];
						const tagContent = accessory.tag ?? accessory.date;
						const textContent = accessory.text;

						$$renderer.push(`<div class="text-muted-foreground flex items-center gap-1 text-sm"${$.attr('title', accessory.tooltip ?? undefined)}>`);

						if (accessory.icon) {
							$$renderer.push('<!--[0-->');
							Icon($$renderer, { icon: accessory.icon, class: 'size-3.5' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (tagContent) {
							$$renderer.push('<!--[0-->');

							const tagValue = typeof tagContent === 'object' && tagContent !== null && 'value' in tagContent ? tagContent.value : tagContent;
							const tagColorProp = typeof tagContent === 'object' && tagContent !== null && 'color' in tagContent ? tagContent.color : undefined;
							const tagText = tagValue instanceof Date ? formatRelative(tagValue) : tagValue;

							const color = tagColorProp
								? colorLikeToColor(tagColorProp, mode.current === 'dark')
								: 'var(--color-muted-foreground)';

							$$renderer.push(`<span class="rounded px-1.5 py-0.5 text-xs font-medium"${$.attr_style('', {
								color,
								'background-color': tagColorProp
									? `color-mix(in srgb, ${color} 15%, transparent)`
									: 'transparent'
							})}>${$.escape(tagText)}</span>`);
						} else if (textContent) {
							$$renderer.push('<!--[1-->');

							const textValue = typeof textContent === 'object' ? textContent.value : textContent;

							const textColor = typeof textContent === 'object' && textContent.color
								? colorLikeToColor(textContent.color, mode.current === 'dark')
								: undefined;

							$$renderer.push(`<span${$.attr_style('', { color: textColor })}>${$.escape(textValue)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			ListItemBase($$renderer, {
				title: props.title,
				icon: props.icon,
				isSelected: selected,
				onclick: restProps.onclick,
				accessories,
				$$slots: { accessories: true }
			});
		}
	});
}