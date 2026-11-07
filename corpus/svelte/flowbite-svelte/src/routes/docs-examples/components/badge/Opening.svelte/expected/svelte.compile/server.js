import * as $ from 'svelte/internal/server';
import { Badge, Button } from "flowbite-svelte";

export default function Opening($$renderer) {
	let openBadgeStatus = false;

	function openBadge() {
		openBadgeStatus = true;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: openBadge,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open badge`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Badge($$renderer, {
			class: 'ml-4',
			color: 'blue',
			dismissable: true,
			large: true,
			get badgeStatus() {
				return openBadgeStatus;
			},

			set badgeStatus($$value) {
				openBadgeStatus = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Default`);
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
}