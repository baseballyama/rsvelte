import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Navbar from '../components/Navbar.svelte';
import '../app.css';

var root = $.with_script($.from_html(
	`<meta name="description" content="A beautiful, accessible command palette for Svelte 5. Boost productivity with keyboard shortcuts and fuzzy search."/> <meta name="theme-color" content="#0a0a0f"/> <link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/> <script>
		// Theme initialization
		const getTheme = () => localStorage.getItem('theme') || 'dark';
		const applyTheme = () => {
			const theme = getTheme();
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(theme);
		};
		applyTheme();
	</script>`,
	1
));

var root_1 = $.from_html(`<!> <main class="svelte-12qhfyh"><!></main>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment_1 = root_1();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();

		$.next(10);

		$.effect(() => {
			$.document.title = 'Svelte Command Palette - Keyboard-driven productivity for Svelte apps';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	Navbar(node, {});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	$.snippet(node_1, () => $$props.children);
	$.reset(main);
	$.append($$anchor, fragment_1);
}