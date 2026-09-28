import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { browser } from '$app/environment';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { SHOW_TIPS_ON_HOMEPAGE } from '$lib/config/customizable-settings';

export default function QuickTips($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tips = [
			{
				icon: 'settings',
				title: 'Customize the app in the settings',
				description: 'Choose your homepage layout, nav links, theme and more',
				shortcut: 'Ctrl + ,'
			},

			{
				icon: 'bookmarks',
				title: 'Bookmark tools for easy access and offline use',
				description: 'Just right-click on any tool to bookmark or edit it'
			},

			{
				icon: 'search',
				title: 'Use Ctrl + K to quickly search all tools',
				description: 'Or, try Ctrl + / to view all shortcuts',
				shortcut: 'Ctrl + K'
			}
		];

		let visible = false;
		let currentTipIndex = 0;
		let mounted = false;
		const STORAGE_KEY = 'networking-toolbox-tips-dismissed';
		const TOOL_USAGE_KEY = 'networking-toolbox-tool-usage';

		function shouldShowTips() {
			const defaultShow = SHOW_TIPS_ON_HOMEPAGE;

			if (!browser) return false;

			try {
				// Check if tips were dismissed
				const dismissed = localStorage.getItem(STORAGE_KEY);

				if (dismissed === 'true') return false;

				// Check tool usage count
				const toolUsageStr = localStorage.getItem(TOOL_USAGE_KEY);

				if (toolUsageStr) {
					const toolUsage = JSON.parse(toolUsageStr);
					const visitCount = Object.keys(toolUsage).length;

					if (visitCount >= 3) return false;
				}

				return defaultShow;
			} catch {
				return defaultShow;
			}
		}

		function dismissTips() {
			if (!browser) return;

			try {
				localStorage.setItem(STORAGE_KEY, 'true');
			} catch {
				// Ignore localStorage errors
			}

			visible = false;
		}

		function nextTip() {
			currentTipIndex = (currentTipIndex + 1) % tips.length;
		}

		function previousTip() {
			currentTipIndex = (currentTipIndex - 1 + tips.length) % tips.length;
		}

		onMount(() => {
			mounted = true;

			if (shouldShowTips()) {
				// Load last viewed tip index
				try {
					const lastIndex = localStorage.getItem('networking-toolbox-tip-index');

					if (lastIndex) {
						currentTipIndex = parseInt(lastIndex, 10) % tips.length;
					}
				} catch {
					// Ignore
				}

				// Show tips after a brief delay for smooth entrance
				setTimeout(
					() => {
						visible = true;
					},
					800
				);
			}
		});

		// Save current tip index when it changes
		// Ignore
		const currentTip = $.derived(() => tips[currentTipIndex]);

		if (visible) {
			$$renderer.push(`<!--[0--><div class="quick-tips svelte-nj9t3c" role="complementary" aria-label="Quick tips"><button class="close-btn svelte-nj9t3c" aria-label="Dismiss tips">`);
			Icon($$renderer, { name: 'x', size: 'sm' });
			$$renderer.push(`<!----></button> <div class="tip-main svelte-nj9t3c"><div class="tip-content svelte-nj9t3c"><div class="tip-icon svelte-nj9t3c">`);
			Icon($$renderer, { name: currentTip().icon, size: 'md' });
			$$renderer.push(`<!----></div> <div class="tip-text svelte-nj9t3c"><h3 class="svelte-nj9t3c">Tip: ${$.escape(currentTip().title)}</h3> <p class="svelte-nj9t3c">${$.escape(currentTip().description)}</p></div></div> <div class="tip-controls svelte-nj9t3c"><button class="nav-btn svelte-nj9t3c" aria-label="Previous tip">`);
			Icon($$renderer, { name: 'arrow-left', size: 'sm' });
			$$renderer.push(`<!----></button> <button class="nav-btn svelte-nj9t3c" aria-label="Next tip">`);
			Icon($$renderer, { name: 'arrow-right', size: 'sm' });
			$$renderer.push(`<!----></button></div></div> <div class="tip-dots svelte-nj9t3c"><!--[-->`);

			const each_array = $.ensure_array_like(tips);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let _ = each_array[index];

				$$renderer.push(`<button${$.attr_class('dot svelte-nj9t3c', void 0, { 'active': index === currentTipIndex })}${$.attr('aria-label', `Go to tip ${$.stringify(index + 1)}`)}></button>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}