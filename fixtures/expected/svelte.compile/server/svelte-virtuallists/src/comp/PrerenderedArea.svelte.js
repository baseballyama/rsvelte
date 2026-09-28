import * as $ from 'svelte/internal/server';
import { browser, dev } from '$app/environment';

export default function PrerenderedArea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			/** For dev mode, to work with hot reload, you want to see if the content has been changed. */
			content,

			/** ID of the area, so there will be no collision. */
			id,
			children
		} = $$props;

		const getIdFull = (id) => `prerendered_area_${id}`;

		function getArea() {
			if (!browser) {
				return null;
			}

			// otherwise
			const element = document.getElementById(getIdFull(id));

			if (element) {
				if (!dev || element.hasAttribute('data-content') && element.getAttribute('data-content') === content) {
					return element;
				}
			}
		}

		/** Capture area on initialization (only in browser), before mounting! */
		const area = getArea();

		let duplicatedChildren = null;

		if (area) {
			const childs = area.childNodes;

			duplicatedChildren = Array.from(childs).map((child) => child.cloneNode(true));
		}

		const areaAction = (node) => {
			// After mounting, we need to fill the new area with the prerendered one clones
			if (area !== null) {
				duplicatedChildren?.forEach((child) => {
					node.appendChild(child);
				});
			}
		};

		$$renderer.push(`<div role="presentation"${$.attr('id', getIdFull(id))}${$.attr('data-content', dev ? content : undefined)}>`);

		if (area === null) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}