import * as $ from 'svelte/internal/server';
import { Element, Pane, ThemeUtils } from 'svelte-tweakpane-ui';
import { browser } from '../internal/browser.js';

export default function Toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let innerWidth = browser ? window.innerWidth : 0;

		Pane($$renderer, {
			title: 'Threlte Studio',
			userExpandable: false,
			position: 'fixed',
			width: innerWidth - 12,
			theme: ThemeUtils.presets.standard,
			x: 6,
			y: 6,
			children: ($$renderer) => {
				Element($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div id="toolbar-items-wrapper" class="svelte-1rvmgx6"><div class="toolbar-items toolbar-items-left svelte-1rvmgx6"></div> <div class="toolbar-items toolbar-items-center svelte-1rvmgx6"></div> <div class="toolbar-items toolbar-items-right svelte-1rvmgx6"></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}