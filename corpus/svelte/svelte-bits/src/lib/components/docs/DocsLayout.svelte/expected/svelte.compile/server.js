import * as $ from 'svelte/internal/server';
import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
import Footer from '$lib/components/landing/Footer/Footer.svelte';
import Sidebar from './Sidebar.svelte';
import '$lib/css/docs.css';
import '$lib/css/preview.css';

export default function DocsLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let drawerOpen = false;
		let drawerEl = null;

		function toggle() {
			drawerOpen = !drawerOpen;
		}

		function close() {
			drawerOpen = false;
		}

		function getFocusable(container) {
			return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
		}

		$$renderer.push(`<div class="docs-app">`);
		Navbar($$renderer, { showDocs: true, onhamburger: toggle });
		$$renderer.push(`<!----> <div class="docs-drawer-backdrop"${$.attr('data-open', drawerOpen)} role="presentation"></div> <div class="docs-drawer svelte-fxrvrl"${$.attr('data-open', drawerOpen)} tabindex="-1" role="dialog" aria-modal="true" aria-label="Docs navigation"${$.attr('aria-hidden', !drawerOpen)}${$.attr('inert', !drawerOpen, true)}>`);
		Sidebar($$renderer, { onnavigate: close });
		$$renderer.push(`<!----></div> <div class="docs-wrapper">`);
		Sidebar($$renderer, {});
		$$renderer.push(`<!----> `);
		children($$renderer);
		$$renderer.push(`<!----></div> `);
		Footer($$renderer, {});
		$$renderer.push(`<!----></div>`);
	});
}