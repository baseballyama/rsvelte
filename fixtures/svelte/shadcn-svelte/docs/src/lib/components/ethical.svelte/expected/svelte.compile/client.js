import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dev, browser } from "$app/environment";
import { beforeNavigate } from "$app/navigation";

var root = $.from_html(`<div class="pt-4"><div data-ea-publisher="shadcn-sveltecom" data-ea-type="image"></div></div>`);

export default function Ethical($$anchor, $$props) {
	$.push($$props, true);

	beforeNavigate((navigation) => {
		const isDocIndex = navigation.from?.route.id === "/(app)/(layout)/docs";

		if (isDocIndex) return;

		const goingToDocIndex = navigation.to?.route.id === "/(app)/(layout)/docs";

		if (goingToDocIndex) return;

		refreshEthicalAds();
	});

	function refreshEthicalAds() {
		if (dev) return;
		if (!browser || typeof window === "undefined") return;

		if ("ethicalads" in window) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			window.ethicalads?.reload();
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (!dev) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}