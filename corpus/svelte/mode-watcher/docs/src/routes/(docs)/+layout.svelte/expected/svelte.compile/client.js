import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DocsLayout } from "@svecodocs/kit";
import { navigation } from "$lib/navigation";
import ModeWatcherDark from "$lib/components/logos/mode-watcher-dark.svelte";
import ModeWatcherLight from "$lib/components/logos/mode-watcher-light.svelte";

var root = $.from_html(`<!> <!> <span class="sr-only">Svecodocs</span>`, 1);

export default function _layout($$anchor, $$props) {
	{
		const logo = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ModeWatcherDark(node, { class: 'hidden max-h-6 dark:block' });

			var node_1 = $.sibling(node, 2);

			ModeWatcherLight(node_1, { class: 'block max-h-6 dark:hidden' });
			$.next(2);
			$.append($$anchor, fragment_1);
		};

		DocsLayout($$anchor, {
			get navigation() {
				return navigation;
			},
			logo,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_2);
			},
			$$slots: { logo: true, default: true }
		});
	}
}