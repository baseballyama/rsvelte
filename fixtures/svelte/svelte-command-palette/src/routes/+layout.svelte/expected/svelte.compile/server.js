import * as $ from 'svelte/internal/server';
import Navbar from '../components/Navbar.svelte';
import '../app.css';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$.head('12qhfyh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Svelte Command Palette - Keyboard-driven productivity for Svelte apps</title>`);
		});

		$$renderer.push(`<meta name="description" content="A beautiful, accessible command palette for Svelte 5. Boost productivity with keyboard shortcuts and fuzzy search."/> <meta name="theme-color" content="#0a0a0f"/> <link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/> `);

		$$renderer.push(`<script>
		// Theme initialization
		const getTheme = () => localStorage.getItem('theme') || 'dark';
		const applyTheme = () => {
			const theme = getTheme();
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(theme);
		};
		applyTheme();
	</script>`);
	});

	Navbar($$renderer, {});
	$$renderer.push(`<!----> <main class="svelte-12qhfyh">`);
	children($$renderer);
	$$renderer.push(`<!----></main>`);
}