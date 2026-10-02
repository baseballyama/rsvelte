import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import { isDark } from '../layout';

var root = $.from_html(`<meta rel="manifest"/>`);

export default function Pwa($$anchor, $$props) {
	$.push($$props, true);

	const $isDark = () => $.store_get(isDark, '$isDark', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let ReloadPrompt = $.state(void 0);
	let webManifest = $.state(void 0);

	onMount(async () => {
		if (themeOptions.pwa) {
			const { pwaInfo } = await import('virtual:pwa-info');

			$.set(webManifest, pwaInfo ? pwaInfo.webManifest.linkTag : '', true);

			if (pwaInfo) {
				$.set(ReloadPrompt, (await import('./ReloadPrompt.svelte')).default, true);
			}
		}
	});

	var fragment_2 = $.comment();

	$.head('172e0tx', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.template_effect(() => $.set_attribute(meta, 'href', themeOptions.pwa.darkManifest));
				$.append($$anchor, meta);
			};

			var alternate = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.html(node_1, () => $.get(webManifest));
				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (themeOptions?.pwa?.darkManifest && $isDark()) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	var node_2 = $.first_child(fragment_2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			$.component(node_3, () => $.get(ReloadPrompt), ($$anchor, ReloadPrompt_1) => {
				ReloadPrompt_1($$anchor, {});
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(ReloadPrompt)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
	$$cleanup();
}