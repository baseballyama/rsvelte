import * as $ from 'svelte/internal/server';
import External from './icons/External.svelte';
import { getPathFromBase } from './utils';

export default function Link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {object} Props
		 * @property {string} [label] - Link label
		 * @property {string} [to] - Link URL
		 * @property {boolean} [inline] - Whether the link is inline
		 * @property {boolean} [active] - Whether the link is active
		 * @property {boolean} [highlight] - Whether the link should be highlighted
		 * @property {boolean} [withBase] - Whether the link should have the base URL
		 * @property {string} [target] - Link target attribute (e.g., '_blank', '_self')
		 * @property {import('svelte').Snippet} [labelRenderer] - Prepend content
		 * @property {import('svelte').Snippet} [pre] - Prepend content
		 * @property {import('svelte').Snippet} [children] - Children content
		 */
		/** @type {Props} */
		const {
			label = '',
			to = '',
			inline = true,
			active = false,
			highlight = true,
			withBase = true,
			target,
			pre,
			labelRenderer,
			children
		} = $$props;

		let isExternal = $.derived(() => (/^https?|mailto:/).test(to));
		let toWithBase = $.derived(() => isExternal() ? to : getPathFromBase(to));

		$$renderer.push(`<a${$.attributes(
			{
				href: withBase ? toWithBase() : to,
				class: 'link',
				...target ? { target } : isExternal() ? { target: '_blank' } : {},
				'aria-label': label
			},
			'svelte-m704aw',
			{ 'no-inline': !inline, active, highlight }
		)}>`);

		pre?.($$renderer);
		$$renderer.push(`<!----> `);

		if (labelRenderer) {
			$$renderer.push('<!--[0-->');
			labelRenderer?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span>${$.escape(label)}</span>`);
		}

		$$renderer.push(`<!--]--> `);

		if (isExternal()) {
			$$renderer.push('<!--[0-->');
			External($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}