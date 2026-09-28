import * as $ from 'svelte/internal/server';
import { Label, Input, ButtonGroup, InputAddon } from "flowbite-svelte";
import { EyeOutline, EyeSlashOutline } from "flowbite-svelte-icons";

export default function IconClickHandler($$renderer) {
	let show = false;
	let show1 = false;

	$$renderer.push(`<div>`);

	Label($$renderer, {
		for: 'show-password',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your password`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function left($$renderer) {
			$$renderer.push(`<button class="pointer-events-auto">`);

			if (show) {
				$$renderer.push('<!--[0-->');
				EyeOutline($$renderer, { class: 'h-6 w-6' });
			} else {
				$$renderer.push('<!--[-1-->');
				EyeSlashOutline($$renderer, { class: 'h-6 w-6' });
			}

			$$renderer.push(`<!--]--></button>`);
		}

		Input($$renderer, {
			id: 'show-password',
			type: show ? "text" : "password",
			placeholder: 'Your password here',
			size: 'lg',
			class: 'pl-10',
			left,
			$$slots: { left: true }
		});
	}

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'show-password1',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your password`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			InputAddon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<button>`);

					if (show1) {
						$$renderer.push('<!--[0-->');
						EyeOutline($$renderer, { class: 'h-6 w-6' });
					} else {
						$$renderer.push('<!--[-1-->');
						EyeSlashOutline($$renderer, { class: 'h-6 w-6' });
					}

					$$renderer.push(`<!--]--></button>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'show-password1',
				type: show1 ? "text" : "password",
				placeholder: 'Your password here'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}