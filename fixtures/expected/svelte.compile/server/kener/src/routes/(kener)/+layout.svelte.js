import * as $ from 'svelte/internal/server';
import "../layout.css";
import "../kener.css";
import { ModeWatcher } from "mode-watcher";
import KenerNav from "$lib/components/KenerNav.svelte";
import KenerFooter from "$lib/components/KenerFooter.svelte";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { Toaster } from "$lib/components/ui/sonner/index.js";
import { resolve } from "$app/paths";
import { page } from "$app/state";
import clientResolver from "$lib/client/resolver.js";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, data } = $$props;

		const rssHref = $.derived(() => {
			const params = page.params;

			if (params.monitor_tag) return clientResolver(resolve, `/monitors/${params.monitor_tag}/rss.xml`);
			if (params.page_path) return clientResolver(resolve, `/${params.page_path}/rss.xml`);

			return clientResolver(resolve, "/rss.xml");
		});

		$.head('yjrn1m', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', data.favicon ? clientResolver(resolve, data.favicon) : data.favicon)}/> <link rel="alternate" type="application/rss+xml" title="RSS feed"${$.attr('href', rssHref())}/> `);

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
		$$renderer.push(`<!----> <main class="kener-public status-page-app svelte-yjrn1m">`);
		KenerNav($$renderer, {});
		$$renderer.push(`<!----> <div class="mx-auto max-w-5xl px-4 pt-18 svelte-yjrn1m">`);

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				children: ($$renderer) => {
					children($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> `);
		KenerFooter($$renderer, {});
		$$renderer.push(`<!----></main>`);
	});
}