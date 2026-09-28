import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import IconifyIcon from '../IconifyIcon.svelte';
import External from '../icons/External.svelte';

export default function Feature($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {object} Props
		 * @property {any} i Index of the feature card
		 * @property {any} title Title of the feature card
		 * @property {any} description Description of the feature card
		 * @property {any} [link] Link to navigate to when the card is clicked
		 * @property {(e: any) => any} onkeypress Function to call when the card is pressed
		 * @property {import('./types').CustomIcon} [icon] Custom icon to display in the card
		 */
		/** @type {Props} */
		const {
			onkeypress = undefined,
			title,
			description,
			link = undefined,
			icon = undefined
		} = $$props;

		const external = $.derived(() => (/^https?/).test(link));

		function handleFeatureCardClick() {
			if (!link) return;
			if (external()) window.open(link, '_blank'); else goto(link);
		}

		$$renderer.push(`<div${$.attr_class('feature-item svelte-1g2swee', void 0, { 'clickable': link })} role="link" tabindex="0"><div class="flex justify-between items-start">`);

		if (icon?.type) {
			$$renderer.push(`<!--[0--><div class="icon svelte-1g2swee">`);

			if (icon.type === 'svg') {
				$$renderer.push(`<!--[0-->${$.html(icon.value)}`);
			} else if (icon.type === 'iconify') {
				$$renderer.push('<!--[1-->');
				IconifyIcon($$renderer, $.spread_props([icon]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (external()) {
			$$renderer.push('<!--[0-->');
			External($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="feature-title svelte-1g2swee">${$.escape(title)}</div> <div class="feature-desc svelte-1g2swee">${$.escape(description)}</div></div>`);
	});
}