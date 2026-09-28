import * as $ from 'svelte/internal/server';
import Eye from '$lib/components/Logo.svelte';
import RenderScanObserver from './RenderScanObserver.svelte';
import { onMount } from 'svelte';

export default function RenderScan($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props with defaults
		let {
			initialEnabled = true,
			offsetLeft = 0,
			hideIcon = false,
			callback = undefined,
			duration = 1000
		} = $$props;

		// State management
		let enabled = initialEnabled;

		// Fixed colors for enabled/disabled states
		const enabledColor = '#2189b5';

		const disabledColor = '#9ca3af';

		// Load saved state from localStorage on mount
		onMount(() => {
			const savedState = localStorage.getItem('svelte-render-scan-enabled');

			if (savedState !== null) {
				enabled = savedState === 'true';
			}
		});

		// Toggle handler that also saves to localStorage
		function toggleEnabled() {
			enabled = !enabled;
			localStorage.setItem('svelte-render-scan-enabled', enabled.toString());
		}

		if (enabled) {
			$$renderer.push('<!--[0-->');
			RenderScanObserver($$renderer, { callback, duration });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!hideIcon) {
			$$renderer.push(`<!--[0--><button${$.attr('title', enabled ? 'Disable render scanning' : 'Enable render scanning')} class="svelte-4esu0v"${$.attr_style('', {
				'background-color': enabled ? enabledColor : disabledColor,
				right: `calc(1rem + ${offsetLeft}px)`
			})}><div${$.attr_class('svelte-4esu0v', void 0, { 'enabled': enabled })}>`);

			Eye($$renderer, { color: 'white', size: 24 });
			$$renderer.push(`<!----></div></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}