import * as $ from 'svelte/internal/server';
import { setInitialMode } from "../mode.js";

export default function Mode_watcher_full($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { trueNonce = "", initConfig, themeColors } = $$props;

		$.head('77tzhh', $$renderer, ($$renderer) => {
			if (themeColors) {
				$$renderer.push(`<!--[0--><meta name="theme-color"${$.attr('content', themeColors.dark)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> ${$.html(`<script${trueNonce ? ` nonce=${trueNonce}` : ""}>(` + setInitialMode.toString() + `)(` + JSON.stringify(initConfig) + `);</script>`)}`);
		});
	});
}