import * as $ from 'svelte/internal/server';
import { Badge } from "$lib";
import { Button } from "flowbite-svelte";
import { onMount } from "svelte";

export default function BadgeLocalStorage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const STORAGE_KEY = "example-badge-hidden";
		let badgeVisible = true;
		let hasSeen = false;

		onMount(() => {
			const exists = localStorage.getItem(STORAGE_KEY);

			hasSeen = Boolean(exists);
			badgeVisible = !exists; // hide if localStorage says so
		});

		function dismiss() {
			localStorage.setItem(STORAGE_KEY, "true");
			badgeVisible = false;
			hasSeen = true;
		}

		function reset() {
			localStorage.removeItem(STORAGE_KEY);
			badgeVisible = true;
			hasSeen = false;
		}

		if (hasSeen) {
			$$renderer.push(`<!--[0--><div class="mb-3 flex items-center gap-3 text-sm text-gray-600"><span>Badge is hidden because you dismissed it earlier. Remove <code>example-badge-hidden</code> from localStorage or click Reset:</span> `);

			Button($$renderer, {
				size: 'xs',
				onclick: reset,
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

		if (badgeVisible) {
			$$renderer.push('<!--[0-->');

			Badge($$renderer, {
				dismissable: true,
				onclose: dismiss,
				color: 'primary',
				class: 'cursor-pointer',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Example badge (click × to dismiss)`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}