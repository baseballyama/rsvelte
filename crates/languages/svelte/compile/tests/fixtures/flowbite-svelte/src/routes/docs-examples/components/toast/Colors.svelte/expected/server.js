import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";

import {
	CheckCircleSolid,
	ExclamationCircleSolid,
	FireOutline,
	CloseCircleSolid
} from "flowbite-svelte-icons";

export default function Colors($$renderer) {
	{
		function icon($$renderer) {
			CheckCircleSolid($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span class="sr-only">Check icon</span>`);
		}

		Toast($$renderer, {
			color: 'green',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Item moved successfully.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			CloseCircleSolid($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span class="sr-only">Error icon</span>`);
		}

		Toast($$renderer, {
			color: 'red',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Item has been deleted.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			ExclamationCircleSolid($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span class="sr-only">Warning icon</span>`);
		}

		Toast($$renderer, {
			color: 'red',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Improve password difficulty.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			FireOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			color: 'gray',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Gray`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			FireOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			color: 'yellow',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Yellow`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			FireOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			color: 'blue',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Blue`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			FireOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			color: 'indigo',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Indigo`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			FireOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			color: 'purple',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Purple`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			FireOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			color: undefined,
			class: 'bg-pink-100 text-pink-500 dark:bg-pink-800 dark:text-pink-200',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Customize your colors.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}