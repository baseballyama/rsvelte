import * as $ from 'svelte/internal/server';
import { Toast, Button } from "flowbite-svelte";
import { slide } from "svelte/transition";
import { CheckCircleSolid } from "flowbite-svelte-icons";

export default function Autohide($$renderer) {
	let toastStatus = true;
	let counter = 6;

	function trigger() {
		toastStatus = true;
		counter = 6;
		timeout();
	}

	function timeout() {
		if (--counter > 0) return setTimeout(timeout, 1000);

		toastStatus = false;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex gap-10">`);

		Button($$renderer, {
			onclick: trigger,
			class: 'my-3',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Restart`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function icon($$renderer) {
				CheckCircleSolid($$renderer, { class: 'h-5 w-5' });
			}

			Toast($$renderer, {
				dismissable: false,
				transition: slide,
				get toastStatus() {
					return toastStatus;
				},

				set toastStatus($$value) {
					toastStatus = $$value;
					$$settled = false;
				},
				icon,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Autohide in ${$.escape(counter)}s.`);
				},
				$$slots: { icon: true, default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}