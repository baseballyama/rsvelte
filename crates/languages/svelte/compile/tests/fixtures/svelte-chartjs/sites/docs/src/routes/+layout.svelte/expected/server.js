import * as $ from 'svelte/internal/server';
import '../app.css';
import Sidebar from '$lib/components/Sidebar.svelte';
import Header from '$lib/components/Header.svelte';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;
	let sidebarOpen = false;

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Header($$renderer, { onToggleSidebar: toggleSidebar });
		$$renderer.push(`<!----> <div class="shell svelte-12evr8a">`);

		Sidebar($$renderer, {
			get open() {
				return sidebarOpen;
			},

			set open($$value) {
				sidebarOpen = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <main class="svelte-12evr8a">`);
		children($$renderer);
		$$renderer.push(`<!----></main></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}