import * as $ from 'svelte/internal/server';
import { AnimatedLogo, DragRegion } from '$lib/components';

export default function LoadingScreen($$renderer) {
	DragRegion($$renderer, {});
	$$renderer.push(`<!----> <section class="container svelte-xcf0tf">`);
	AnimatedLogo($$renderer, {});
	$$renderer.push(`<!----> <div class="text-container svelte-xcf0tf"><h2 class="title svelte-xcf0tf">Loading your data...</h2> <p class="subtitle svelte-xcf0tf">This can take a bit of time.</p></div> <div class="loading-line svelte-xcf0tf"></div></section>`);
}