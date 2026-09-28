import * as $ from 'svelte/internal/server';
import { ModeWatcher } from 'mode-watcher';
import './layout.css';
import { Toaster } from '$lib/components/ui/sonner/index.js';
import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
import Search from '$lib/components/custom/docs/Search.svelte';

export default function _layout($$renderer, $$props) {
	const { children } = $$props;

	ModeWatcher($$renderer, {});
	$$renderer.push(`<!----> `);
	Toaster($$renderer, { richColors: true, closeButton: true });
	$$renderer.push(`<!----> `);
	Search($$renderer, {});
	$$renderer.push(`<!----> `);

	TooltipProvider($$renderer, {
		children: ($$renderer) => {
			children($$renderer);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}