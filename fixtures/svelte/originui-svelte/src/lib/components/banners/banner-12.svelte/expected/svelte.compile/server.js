import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Download from '@lucide/svelte/icons/download';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';

export default function Banner_12($$renderer) {
	let isDownloading = false;

	function handleDownload() {
		isDownloading = true;
		setTimeout(() => isDownloading = false, 2000);
	}

	$$renderer.push(`<div class="bg-muted px-4 py-3 md:py-2"><div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"><p class="text-sm"><span class="font-medium">v2.1.0</span> <span class="text-muted-foreground mx-2">•</span> New features and improvements available</p> `);

	Button($$renderer, {
		size: 'sm',
		variant: 'outline',
		disabled: isDownloading,
		onclick: handleDownload,
		class: 'min-w-24',
		children: ($$renderer) => {
			if (isDownloading) {
				$$renderer.push('<!--[0-->');

				LoaderCircle($$renderer, {
					class: '-ms-0.5 animate-spin',
					size: 16,
					'aria-hidden': 'true'
				});

				$$renderer.push(`<!----> Updating...`);
			} else {
				$$renderer.push('<!--[-1-->');
				Download($$renderer, { size: 16, class: '-ms-0.5', 'aria-hidden': 'true' });
				$$renderer.push(`<!----> Update now`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}