import * as $ from 'svelte/internal/server';
import { Toast, P, Button, Heading } from "flowbite-svelte";
import { fly } from "svelte/transition";

export default function StackVertical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let toasts = [];
		let nextId = 1;

		const messages = {
			green: "Successfully saved!",
			blue: "New message received",
			yellow: "Please review your changes",
			red: "Operation failed"
		};

		function addToast(color) {
			const selectedColor = color || ["green", "blue", "yellow", "red"][Math.floor(Math.random() * 4)];

			const newToast = {
				id: nextId,
				message: messages[selectedColor],
				color: selectedColor
			};

			toasts = [...toasts, newToast];
			nextId++;

			// Auto-dismiss after 5 seconds
			const timeoutId = setTimeout(
				() => {
					dismissToast(newToast.id);
				},
				5000
			);

			// Store timeout ID for cleanup
			toasts = toasts.map((t) => t.id === newToast.id ? { ...t, timeoutId } : t);
		}

		function dismissToast(id) {
			// Clear timeout if it exists
			const toast = toasts.find((t) => t.id === id);

			if (toast?.timeoutId) {
				clearTimeout(toast.timeoutId);
			}

			toasts = toasts.filter((toast) => toast.id !== id);
		}

		function handleClose(id) {
			return () => {
				dismissToast(id);
			};
		}

		$$renderer.push(`<div class="relative min-h-screen p-8"><div class="z-50 space-y-3" style="position: absolute; top: 1rem; right: 1rem;"><!--[-->`);

		const each_array = $.ensure_array_like(toasts);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let toast = each_array[$$index];

			Toast($$renderer, {
				color: toast.color,
				dismissable: true,
				transition: fly,
				params: { x: 400, duration: 300 },
				class: 'w-64',
				onclose: handleClose(toast.id),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(toast.message)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> <div class="mx-auto max-w-2xl"><div class="rounded-xl p-8 shadow-lg"><div class="mb-6 flex items-center gap-3"><svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> `);

		Heading($$renderer, {
			tag: 'h1',
			class: 'text-3xl',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toast Notifications Demo`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'mb-8',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click the buttons below to trigger toast notifications. Each toast will appear in the top-right corner and automatically dismiss after 5 seconds.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="space-y-4"><div class="grid grid-cols-2 gap-3">`);

		Button($$renderer, {
			onclick: () => addToast("green"),
			color: 'green',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Success Toast`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => addToast("blue"),
			color: 'blue',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Info Toast`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => addToast("yellow"),
			color: 'yellow',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Warning Toast`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => addToast("red"),
			color: 'red',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Error Toast`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Button($$renderer, {
			onclick: () => addToast(),
			color: 'dark',
			class: 'w-full',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Random Toast`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div></div>`);
	});
}