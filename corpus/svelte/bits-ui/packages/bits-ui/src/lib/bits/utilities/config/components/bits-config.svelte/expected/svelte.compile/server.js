import * as $ from 'svelte/internal/server';
import { useBitsConfig } from "../bits-config.js";
import { boxWith } from "svelte-toolbelt";

export default function Bits_config($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, defaultPortalTo, defaultLocale } = $$props;

		useBitsConfig({
			defaultPortalTo: boxWith(() => defaultPortalTo),
			defaultLocale: boxWith(() => defaultLocale)
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}