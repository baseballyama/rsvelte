import * as $ from 'svelte/internal/server';
import { Alert } from "flowbite-svelte";

export default function Event($$renderer) {
	let alertStatus = true;

	const closeAlert = () => {
		alert("Clicked closeAlert.");
		alertStatus = !alertStatus;
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Alert($$renderer, {
			dismissable: true,
			onclick: closeAlert,
			get alertStatus() {
				return alertStatus;
			},

			set alertStatus($$value) {
				alertStatus = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Close me`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}