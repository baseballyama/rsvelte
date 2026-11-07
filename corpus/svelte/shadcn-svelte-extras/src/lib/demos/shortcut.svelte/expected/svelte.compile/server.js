import * as $ from 'svelte/internal/server';
import { Kbd, KbdGroup } from '$lib/components/ui/kbd';
import { toast } from 'svelte-sonner';
import { shortcut } from '$lib/actions/shortcut.svelte';
import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';

export default function Shortcut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p class="flex place-items-center justify-center gap-1">`);

		KbdGroup($$renderer, {
			children: ($$renderer) => {
				Kbd($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(cmdOrCtrl)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <span>+</span> `);

				Kbd($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->1`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p>`);
	});
}