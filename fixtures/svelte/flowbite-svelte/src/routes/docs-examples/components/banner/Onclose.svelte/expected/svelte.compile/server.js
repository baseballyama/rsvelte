import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Banner, P, Button } from "flowbite-svelte";

export default function Onclose($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function useDismissableBanner(storageKey) {
			let open = false;
			let hasSeen = false;

			onMount(() => {
				const exists = localStorage.getItem(storageKey);

				hasSeen = Boolean(exists);
				open = !exists;
			});

			function onclose(_event) {
				localStorage.setItem(storageKey, "true");
				open = false;
				hasSeen = true;
			}

			function reset() {
				localStorage.removeItem(storageKey);
				hasSeen = false;
				open = true; // show banner again
			}

			return {
				get open() {
					return open;
				},

				set open(value) {
					open = value;
				},

				get hasSeen() {
					return hasSeen;
				},
				onclose,
				reset
			};
		}

		const banner = useDismissableBanner("announcement-example");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (banner.hasSeen) {
				$$renderer.push(`<!--[0--><div class="mb-3 flex items-center gap-3 text-sm text-gray-600"><span>Banner is hidden because you dismissed it earlier. Remove <code>announcement-example</code> from localStorage to show it again or click the reset button.</span> `);

				Button($$renderer, {
					size: 'xs',
					onclick: banner.reset,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Reset`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Banner($$renderer, {
				onclose: banner.onclose,
				get open() {
					return banner.open;
				},

				set open($$value) {
					banner.open = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This keeps announcement banners hidden after dismissal across page refreshes!`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}