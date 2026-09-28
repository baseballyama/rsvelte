import * as $ from 'svelte/internal/server';
import "../layout.css";
import "../kener.css";
import { ModeWatcher } from "mode-watcher";
import { resolve } from "$app/paths";
import { Toaster } from "$lib/components/ui/sonner/index.js";
import clientResolver from "$lib/client/resolver.js";
import KenerNav from "$lib/components/KenerNav.svelte";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, data } = $$props;

		$.head('1g21n8g', $$renderer, ($$renderer) => {
			$$renderer.push(`<meta name="robots" content="noindex, nofollow"/> <link rel="icon"${$.attr('href', data.favicon ? clientResolver(resolve, data.favicon) : data.favicon)}/> `);

			if (data.font?.cssSrc) {
				$$renderer.push(`<!--[0--><link rel="stylesheet"${$.attr('href', data.font.cssSrc)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> ${$.html(`
	<style id="dynamic-styles">
		body {
			--up: ${data.siteStatusColors.UP};
			--degraded: ${data.siteStatusColors.DEGRADED};
			--down: ${data.siteStatusColors.DOWN};
			--maintenance: ${data.siteStatusColors.MAINTENANCE};
			--accent: ${data.siteStatusColors.ACCENT || "#f4f4f5"};
			--accent-foreground: ${data.siteStatusColors.ACCENT_FOREGROUND || data.siteStatusColors.ACCENT || "#e96e2d"};
			${data.font?.family
				? `--font-family:'${data.font.family}', sans-serif;`
				: ""}
		}
		:is(.dark) body {
			--up: ${data.siteStatusColorsDark.UP};
			--degraded: ${data.siteStatusColorsDark.DEGRADED};
			--down: ${data.siteStatusColorsDark.DOWN};
			--maintenance: ${data.siteStatusColorsDark.MAINTENANCE};
			--accent: ${data.siteStatusColorsDark.ACCENT || "#27272a"};
			--accent-foreground: ${data.siteStatusColorsDark.ACCENT_FOREGROUND || data.siteStatusColorsDark.ACCENT || "#e96e2d"};
		}
		${data.customCSS || ""}
	</style>`)} `);

			$$renderer.push(`<script${$.attr('src', clientResolver(resolve, "/capture.js"))}></script>`);
		});

		ModeWatcher($$renderer, { defaultMode: data.defaultSiteTheme });
		$$renderer.push(`<!----> `);
		Toaster($$renderer, {});
		$$renderer.push(`<!----> <main class="svelte-1g21n8g">`);
		KenerNav($$renderer, {});
		$$renderer.push(`<!----> <div class="mx-auto max-w-5xl svelte-1g21n8g">`);
		children($$renderer);
		$$renderer.push(`<!----></div></main>`);
	});
}