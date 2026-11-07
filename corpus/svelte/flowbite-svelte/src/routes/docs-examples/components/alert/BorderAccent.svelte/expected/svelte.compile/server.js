import * as $ from 'svelte/internal/server';
import { Alert } from "flowbite-svelte";
import { InfoCircleSolid } from "flowbite-svelte-icons";

export default function BorderAccent($$renderer) {
	{
		function icon($$renderer) {
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
		}

		Alert($$renderer, {
			rounded: false,
			class: 'border-t-4',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-medium">Info alert!</span> Change a few things up and try submitting again.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
		}

		Alert($$renderer, {
			color: 'red',
			rounded: false,
			class: 'border-t-4',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-medium">Danger alert!</span> Change a few things up and try submitting again.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
		}

		Alert($$renderer, {
			color: 'green',
			rounded: false,
			class: 'border-t-4',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-medium">Success alert!</span> Change a few things up and try submitting again.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
		}

		Alert($$renderer, {
			color: 'yellow',
			rounded: false,
			class: 'border-t-4',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-medium">Warning alert!</span> Change a few things up and try submitting again.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
		}

		Alert($$renderer, {
			color: 'secondary',
			rounded: false,
			class: 'flex-row-reverse border-t-4',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-medium">Dark alert!</span> Change a few things up and try submitting again.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}