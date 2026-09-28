import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<link rel="stylesheet"/>`);
var root_1 = $.with_script($.from_html(`<link rel="icon"/> <link rel="alternate" type="application/rss+xml" title="RSS feed"/> <!> <!> <script></script>`, 1));
var root_2 = $.from_html(`<!> <!> <main class="kener-public status-page-app svelte-yjrn1m"><!> <div class="mx-auto max-w-5xl px-4 pt-18 svelte-yjrn1m"><!></div> <!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const rssHref = $.derived(() => {
		const params = page.params;

		if (params.monitor_tag) return clientResolver(resolve, `/monitors/${params.monitor_tag}/rss.xml`);
		if (params.page_path) return clientResolver(resolve, `/${params.page_path}/rss.xml`);

		return clientResolver(resolve, "/rss.xml");
	});

	var fragment_1 = root_2();

	$.head('yjrn1m', ($$anchor) => {
		var fragment = root_1();
		var link = $.first_child(fragment);
		var link_1 = $.sibling(link, 2);
		var node = $.sibling(link_1, 2);

		{
			var consequent = ($$anchor) => {
				var link_2 = root();

				$.template_effect(() => $.set_attribute(link_2, 'href', $$props.data.font.cssSrc));
				$.append($$anchor, link_2);
			};

			$.if(node, ($$render) => {
				if ($$props.data.font?.cssSrc) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		$.html(node_1, () => `
	<style id="dynamic-styles">
		body {
			--up: ${$$props.data.siteStatusColors.UP};
			--degraded: ${$$props.data.siteStatusColors.DEGRADED};
			--down: ${$$props.data.siteStatusColors.DOWN};
			--maintenance: ${$$props.data.siteStatusColors.MAINTENANCE};
			--accent: ${$$props.data.siteStatusColors.ACCENT || "#f4f4f5"};
			--accent-foreground: ${$$props.data.siteStatusColors.ACCENT_FOREGROUND || $$props.data.siteStatusColors.ACCENT || "#e96e2d"};
			${$$props.data.font?.family
			? `--font-family:'${$$props.data.font.family}', sans-serif;`
			: ""}
		}
		:is(.dark) body {
			--up: ${$$props.data.siteStatusColorsDark.UP};
			--degraded: ${$$props.data.siteStatusColorsDark.DEGRADED};
			--down: ${$$props.data.siteStatusColorsDark.DOWN};
			--maintenance: ${$$props.data.siteStatusColorsDark.MAINTENANCE};
			--accent: ${$$props.data.siteStatusColorsDark.ACCENT || "#27272a"};
			--accent-foreground: ${$$props.data.siteStatusColorsDark.ACCENT_FOREGROUND || $$props.data.siteStatusColorsDark.ACCENT || "#e96e2d"};
		}
		${$$props.data.customCSS || ""}
	</style>`);

		var script = $.sibling(node_1, 2);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(link, 'href', $0);
				$.set_attribute(link_1, 'href', $.get(rssHref));
				$.set_attribute(script, 'src', $1);
			},
			[
				() => $$props.data.favicon
					? clientResolver(resolve, $$props.data.favicon)
					: $$props.data.favicon,
				() => clientResolver(resolve, "/capture.js")
			]
		);

		$.append($$anchor, fragment);
	});

	var node_2 = $.first_child(fragment_1);

	ModeWatcher(node_2, {
		get defaultMode() {
			return $$props.data.defaultSiteTheme;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Toaster(node_3, {});

	var main = $.sibling(node_3, 2);
	var node_4 = $.child(main);

	KenerNav(node_4, {});

	var div = $.sibling(node_4, 2);
	var node_5 = $.child(div);

	$.component(node_5, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_6 = $.first_child(fragment_2);

				$.snippet(node_6, () => $$props.children);
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	var node_7 = $.sibling(div, 2);

	KenerFooter(node_7, {});
	$.reset(main);
	$.append($$anchor, fragment_1);
	$.pop();
}