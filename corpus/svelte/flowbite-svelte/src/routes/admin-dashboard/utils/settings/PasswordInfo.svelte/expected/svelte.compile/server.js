import * as $ from 'svelte/internal/server';
import { Button, Input, Label } from "flowbite-svelte";
import { CardWidget } from "flowbite-svelte-admin-dashboard";

export default function PasswordInfo($$renderer) {
	CardWidget($$renderer, {
		title: 'Password Information',
		class: 'max-w-none p-4 sm:p-6',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-6 gap-6">`);

			Label($$renderer, {
				class: 'col-span-6 space-y-2 sm:col-span-3',
				children: ($$renderer) => {
					$$renderer.push(`<span>Current password</span> `);

					Input($$renderer, {
						placeholder: '••••••••',
						class: 'border font-normal outline-none'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Label($$renderer, {
				class: 'col-span-6 space-y-2 sm:col-span-3',
				children: ($$renderer) => {
					$$renderer.push(`<span>New password</span> `);

					Input($$renderer, {
						placeholder: '••••••••',
						class: 'border font-normal outline-none'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Label($$renderer, {
				class: 'col-span-6 space-y-2 sm:col-span-3',
				children: ($$renderer) => {
					$$renderer.push(`<span>Confirm password</span> `);

					Input($$renderer, {
						placeholder: '••••••••',
						class: 'border font-normal outline-none'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				class: 'sm:col-full col-span-6 w-fit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Save all`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}