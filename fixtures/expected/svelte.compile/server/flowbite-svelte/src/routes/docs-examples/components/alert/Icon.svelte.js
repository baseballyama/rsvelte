import * as $ from 'svelte/internal/server';
import { Alert } from "flowbite-svelte";
import { InfoCircleSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	{
		function icon($$renderer) {
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
		}

		Alert($$renderer, {
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-medium">Default alert!</span> Change a few things up and try submitting again.`);
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
			color: 'blue',
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
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-medium">Dark alert!</span> Change a few things up and try submitting again.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}