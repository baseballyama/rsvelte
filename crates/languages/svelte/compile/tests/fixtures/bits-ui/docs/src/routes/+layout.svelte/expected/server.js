import * as $ from 'svelte/internal/server';
import { Toaster } from "svelte-sonner";
import { ModeWatcher } from "mode-watcher";
import Metadata from "$lib/components/metadata.svelte";
import "$lib/styles/app.css";
import { useSiteConfig } from "$lib/utils/use-site-config.svelte.js";
import { siteConfig } from "$lib/config/site.js";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		useSiteConfig(() => siteConfig);
		ModeWatcher($$renderer, {});
		$$renderer.push(`<!----> `);
		Metadata($$renderer, {});
		$$renderer.push(`<!----> `);
		Toaster($$renderer, { position: 'top-right' });
		$$renderer.push(`<!----> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}