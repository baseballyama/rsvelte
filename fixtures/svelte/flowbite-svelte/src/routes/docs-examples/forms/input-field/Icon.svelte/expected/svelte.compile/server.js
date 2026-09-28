import * as $ from 'svelte/internal/server';
import { Label, Input, CloseButton } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	Label($$renderer, {
		class: 'space-y-2',
		children: ($$renderer) => {
			$$renderer.push(`<div>Small input - left icon</div> `);

			{
				function left($$renderer) {
					EnvelopeSolid($$renderer, { class: 'h-4 w-4' });
				}

				Input($$renderer, {
					type: 'email',
					placeholder: 'name@flowbite.com',
					size: 'sm',
					class: 'ps-8',
					left,
					$$slots: { left: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'space-y-2',
		children: ($$renderer) => {
			$$renderer.push(`<div>Default input - right icon</div> `);

			{
				function left($$renderer) {
					EnvelopeSolid($$renderer, { class: 'h-5 w-5' });
				}

				Input($$renderer, {
					type: 'email',
					placeholder: 'name@flowbite.com',
					size: 'md',
					class: 'ps-9',
					left,
					$$slots: { left: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'space-y-2',
		children: ($$renderer) => {
			$$renderer.push(`<div>Large input - both icons</div> `);

			{
				function left($$renderer) {
					EnvelopeSolid($$renderer, { class: 'h-6 w-6' });
				}

				function right($$renderer) {
					CloseButton($$renderer, {});
				}

				Input($$renderer, {
					type: 'email',
					placeholder: 'name@flowbite.com',
					size: 'lg',
					class: 'ps-11',
					left,
					right,
					$$slots: { left: true, right: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}