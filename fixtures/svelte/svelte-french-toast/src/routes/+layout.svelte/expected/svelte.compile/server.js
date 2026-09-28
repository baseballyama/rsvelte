import * as $ from 'svelte/internal/server';
import '../app.css';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$.head('12qhfyh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Svelte French Toast</title>`);
		});

		$$renderer.push(`<meta name="title" content="Svelte French Toast"/> <meta name="description" content="Buttery smooth toast notifications for Svelte. Lightweight, customizable, and beautiful by default."/> <meta property="og:type" content="website"/> <meta property="og:url" content="https://svelte-french-toast.com/"/> <meta property="og:title" content="Svelte French Toast"/> <meta property="og:description" content="Buttery smooth toast notifications for Svelte. Lightweight, customizable, and beautiful by default."/> <meta property="og:image" content="https://svelte-french-toast.com/og-image.png"/> <meta property="twitter:card" content="summary_large_image"/> <meta property="twitter:url" content="https://svelte-french-toast.com/"/> <meta property="twitter:title" content="Svelte French Toast"/> <meta property="twitter:description" content="Buttery smooth toast notifications for Svelte. Lightweight, customizable, and beautiful by default."/> <meta property="twitter:image" content="https://svelte-french-toast.com/og-image.png"/>`);
	});

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}