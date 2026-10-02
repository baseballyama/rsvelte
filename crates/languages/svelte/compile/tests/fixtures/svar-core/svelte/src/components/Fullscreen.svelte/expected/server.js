import * as $ from 'svelte/internal/server';
import { hotkeys } from "@svar-ui/lib-dom";
import Button from "./Button.svelte";

export default function Fullscreen($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { hotkey = null, toggleButton, children } = $$props;
		let node = null;
		let inFullscreen = false;
		let icon = $.derived(() => `wxi-${inFullscreen ? "collapse" : "expand"}`);

		function toggleFullscreen() {
			if (!inFullscreen && node) {
				node.requestFullscreen();
			} else if (inFullscreen) {
				document.exitFullscreen();
			}

			inFullscreen = !inFullscreen;
		}

		const setFullscreenState = () => {
			inFullscreen = document.fullscreenElement === node;
		};

		$$renderer.push(`<div class="wx-fullscreen svelte-1oh95pl" tabindex="-1">`);
		children?.($$renderer);
		$$renderer.push(`<!----> `);

		if (toggleButton) {
			$$renderer.push('<!--[0-->');
			toggleButton($$renderer, toggleFullscreen, inFullscreen);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			Button($$renderer, {
				css: 'wx-fullscreen-button',
				onclick: toggleFullscreen,
				children: ($$renderer) => {
					$$renderer.push(`<i${$.attr_class(`${icon()} wx-fullscreen-icon`, 'svelte-1oh95pl')}></i>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}