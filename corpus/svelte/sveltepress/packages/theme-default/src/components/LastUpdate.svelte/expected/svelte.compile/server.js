import * as $ from 'svelte/internal/server';
import themeOptions from 'virtual:sveltepress/theme-default';

export default function LastUpdate($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {object} Props
		 * @property {string} [lastUpdate] - Last update time
		 */
		/** @type {Props} */
		const { lastUpdate = '' } = $$props;

		const DEFAULT_TEXT = 'Last update at:';

		if (lastUpdate) {
			$$renderer.push(`<!--[0--><div class="last-update svelte-ctu6kd">${$.escape(themeOptions.i18n?.lastUpdateAt || DEFAULT_TEXT)}
    ${$.escape(lastUpdate.replace(/:\d{2}$/, ''))}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}