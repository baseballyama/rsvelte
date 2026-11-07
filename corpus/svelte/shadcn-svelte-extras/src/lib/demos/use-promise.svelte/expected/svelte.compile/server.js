import * as $ from 'svelte/internal/server';
import { PMCommand } from '$lib/components/ui/pm-command';
import { UsePromise } from '$lib/hooks/use-promise.svelte';
import { onMount } from 'svelte';

export default function Use_promise($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let resolve = void 0;

		const promise = new Promise((res) => {
			resolve = () => res('1.40.1');
		});

		const version = new UsePromise(promise, '1.x.x');

		onMount(() => {
			const timeout = setTimeout(
				() => {
					resolve?.();
				},
				2500
			);

			return () => {
				clearTimeout(timeout);
			};
		});

		$$renderer.push(`<div class="w-full p-6">`);

		PMCommand($$renderer, {
			command: 'execute',
			args: [
				`jsrepo@${version.current}`,
				'add',
				'hooks/use-promise.svelte'
			]
		});

		$$renderer.push(`<!----></div>`);
	});
}