import * as $ from 'svelte/internal/server';
import Header from '$lib/ui/header/header.svelte';
import Footer from '$lib/ui/footer.svelte';
import LiteYouTubeEmbed from '$lib/embed/youtube.svelte';
import { useAnalytics } from '$lib/analytics';
import { setupViewTransition } from '$lib/utils';
import '../styles/styles.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		useAnalytics();
		setupViewTransition();

		let { children } = $$props;

		LiteYouTubeEmbed($$renderer, {});
		$$renderer.push(`<!----> <div class="container svelte-12qhfyh">`);
		Header($$renderer, {});
		$$renderer.push(`<!----> <div class="layout svelte-12qhfyh">`);
		children?.($$renderer);
		$$renderer.push(`<!----> `);
		Footer($$renderer, {});
		$$renderer.push(`<!----></div></div>`);
	});
}