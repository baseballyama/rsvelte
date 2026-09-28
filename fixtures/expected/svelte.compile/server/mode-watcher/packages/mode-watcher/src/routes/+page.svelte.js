import * as $ from 'svelte/internal/server';

import {
	mode,
	resetMode,
	setMode,
	systemPrefersMode,
	theme,
	toggleMode,
	userPrefersMode
} from "$lib/index.js";

import { isBrowser } from "$lib/utils.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const htmlElement = $.derived(() => {
			mode.current;
			theme.current;

			if (!isBrowser) return;

			const htmlElement = document.documentElement;

			if (htmlElement) {
				return htmlElement.outerHTML.replace(`${htmlElement.innerHTML}</html>`, "");
			}
		});

		const themeColorElement = $.derived(() => {
			mode.current;

			if (!isBrowser) return;

			const themeColorElement = document.querySelector('meta[name="theme-color"]');

			if (themeColorElement) {
				return themeColorElement.outerHTML;
			}
		});

		$$renderer.push(`<div class="container space-y-4 py-12"><p>User prefers mode: ${$.escape(userPrefersMode.current)}</p> <p>System prefers mode: ${$.escape(systemPrefersMode.current)}</p> <p>Current mode: ${$.escape(mode.current)}</p> <p>Custom theme: ${$.escape(theme.current ? theme.current : "N/A")}</p> `);

		if (htmlElement() !== undefined) {
			$$renderer.push(`<!--[0--><pre>${$.escape(htmlElement())}</pre>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (themeColorElement() !== undefined) {
			$$renderer.push(`<!--[0--><pre>${$.escape(themeColorElement())}</pre>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Toggle</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Light Mode</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Dark Mode</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">System Mode</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Reset</button></div>`);
	});
}