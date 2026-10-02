import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Element, Pane, ThemeUtils } from 'svelte-tweakpane-ui';
import { browser } from '../internal/browser.js';

var root = $.from_html(`<div id="toolbar-items-wrapper" class="svelte-1rvmgx6"><div class="toolbar-items toolbar-items-left svelte-1rvmgx6"></div> <div class="toolbar-items toolbar-items-center svelte-1rvmgx6"></div> <div class="toolbar-items toolbar-items-right svelte-1rvmgx6"></div></div>`);

export default function Toolbar($$anchor, $$props) {
	$.push($$props, true);

	let innerWidth = browser ? window.innerWidth : 0;

	{
		let $0 = $.derived(() => innerWidth - 12);

		Pane($$anchor, {
			title: 'Threlte Studio',
			userExpandable: false,
			position: 'fixed',
			get width() {
				return $.get($0);
			},

			get theme() {
				return ThemeUtils.presets.standard;
			},
			x: 6,
			y: 6,
			children: ($$anchor, $$slotProps) => {
				Element($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var div = root();

						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.bind_window_size('innerWidth', ($$value) => innerWidth = $$value);
	$.pop();
}