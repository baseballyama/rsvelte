import * as $ from 'svelte/internal/server';
import Logo from '$lib/components/common/Logo/Logo.svelte';
import Controls from '$lib/components/generator/Controls/Controls.svelte';
import Preview from '$lib/components/generator/Preview/Preview.svelte';
import { generatePreviewCss } from '$lib/utils/generator/generate-css';
import { generateFontFaces } from '$lib/utils/generator/generate-font-faces';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('1yrilx', $$renderer, ($$renderer) => {
			$$renderer.push(`${$.html(`<style>${generatePreviewCss()}</style>`)} ${$.html(`<style>${generateFontFaces()}</style>`)}`);
		});

		$$renderer.push(`<div class="lg:hidden absolute top-0 z-50 left-0 w-full h-full bg-surface-50-950 flex justify-center items-center p-4"><div class="card bg-surface-100-900 max-w-96 p-10 space-y-5 shadow-xl">`);
		Logo($$renderer, {});
		$$renderer.push(`<!----> <h2 class="h2">Not Available.</h2> <p class="opacity-60">The theme generator is not currently available for small screen devices. We recommend using either a tablet or desktop.</p></div></div> <main class="h-full grid grid-cols-[1fr_480px]">`);
		Preview($$renderer, {});
		$$renderer.push(`<!----> `);
		Controls($$renderer, {});
		$$renderer.push(`<!----></main>`);
	});
}