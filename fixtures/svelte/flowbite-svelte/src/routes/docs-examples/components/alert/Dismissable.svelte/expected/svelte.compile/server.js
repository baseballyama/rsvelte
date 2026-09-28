import * as $ from 'svelte/internal/server';
import { Alert } from "flowbite-svelte";
import { InfoCircleSolid, EnvelopeSolid } from "flowbite-svelte-icons";
import { fly } from "svelte/transition";

export default function Dismissable($$renderer) {
	{
		function icon($$renderer) {
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
		}

		Alert($$renderer, {
			dismissable: true,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->A simple default alert with an <a href="/" class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900">example link</a> . Give it a click if you like.`);
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
			dismissable: true,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->A simple info alert with an <a href="/" class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900">example link</a> . Give it a click if you like.`);
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
			dismissable: true,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->A simple info alert with an <a href="/" class="font-semibold underline hover:text-red-800 dark:hover:text-red-900">example link</a> . Give it a click if you like.`);
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
			dismissable: true,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->A simple info alert with an <a href="/" class="font-semibold underline hover:text-green-800 dark:hover:text-green-900">example link</a> . Give it a click if you like.`);
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
			dismissable: true,
			transition: fly,
			params: { x: 200 },
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->An alert with non default animation - fly away.`);
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
			color: 'purple',
			dismissable: true,
			closeIcon: EnvelopeSolid,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->An alert with the custom dismissal button. slot`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}