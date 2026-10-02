import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../layout.css";
import "../kener.css";
import { ModeWatcher } from "mode-watcher";
import { resolve } from "$app/paths";
import { Toaster } from "$lib/components/ui/sonner/index.js";
import clientResolver from "$lib/client/resolver.js";
import KenerNav from "$lib/components/KenerNav.svelte";

var root = $.from_html(`<link rel="stylesheet"/>`);
var root_1 = $.with_script($.from_html(`<meta name="robots" content="noindex, nofollow"/> <link rel="icon"/> <!> <!> <script></script>`, 1));
var root_2 = $.from_html(`<!> <!> <main class="svelte-1g21n8g"><!> <div class="mx-auto max-w-5xl svelte-1g21n8g"><!></div></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment_1 = root_2();

	$.head('1g21n8g', ($$anchor) => {
		var fragment = root_1();
		var link = $.sibling($.first_child(fragment), 2);
		var node = $.sibling(link, 2);

		{
			var consequent = ($$anchor) => {
				var link_1 = root();

				$.template_effect(() => $.set_attribute(link_1, 'href', $$props.data.font.cssSrc));
				$.append($$anchor, link_1);
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

	$.snippet(node_5, () => $$props.children);
	$.reset(div);
	$.reset(main);
	$.append($$anchor, fragment_1);
	$.pop();
}