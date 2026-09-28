import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { browser } from '$app/environment';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { SHOW_TIPS_ON_HOMEPAGE } from '$lib/config/customizable-settings';

var root = $.from_html(`<button></button>`);
var root_1 = $.from_html(`<div class="quick-tips svelte-nj9t3c" role="complementary" aria-label="Quick tips"><button class="close-btn svelte-nj9t3c" aria-label="Dismiss tips"><!></button> <div class="tip-main svelte-nj9t3c"><div class="tip-content svelte-nj9t3c"><div class="tip-icon svelte-nj9t3c"><!></div> <div class="tip-text svelte-nj9t3c"><h3 class="svelte-nj9t3c"> </h3> <p class="svelte-nj9t3c"> </p></div></div> <div class="tip-controls svelte-nj9t3c"><button class="nav-btn svelte-nj9t3c" aria-label="Previous tip"><!></button> <button class="nav-btn svelte-nj9t3c" aria-label="Next tip"><!></button></div></div> <div class="tip-dots svelte-nj9t3c"></div></div>`);

export default function QuickTips($$anchor, $$props) {
	$.push($$props, true);

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

	let visible = $.state(false);
	let currentTipIndex = $.state(0);
	let mounted = $.state(false);
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

		$.set(visible, false);
	}

	function nextTip() {
		$.set(currentTipIndex, ($.get(currentTipIndex) + 1) % tips.length);
	}

	function previousTip() {
		$.set(currentTipIndex, ($.get(currentTipIndex) - 1 + tips.length) % tips.length);
	}

	onMount(() => {
		$.set(mounted, true);

		if (shouldShowTips()) {
			// Load last viewed tip index
			try {
				const lastIndex = localStorage.getItem('networking-toolbox-tip-index');

				if (lastIndex) {
					$.set(currentTipIndex, parseInt(lastIndex, 10) % tips.length);
				}
			} catch {
				// Ignore
			}

			// Show tips after a brief delay for smooth entrance
			setTimeout(
				() => {
					$.set(visible, true);
				},
				800
			);
		}
	});

	// Save current tip index when it changes
	$.user_effect(() => {
		if (browser && $.get(mounted)) {
			try {
				localStorage.setItem('networking-toolbox-tip-index', $.get(currentTipIndex).toString());
			} catch {
				// Ignore
			}
		}
	});

	const currentTip = $.derived(() => tips[$.get(currentTipIndex)]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var button = $.child(div);
			var node_1 = $.child(button);

			Icon(node_1, { name: 'x', size: 'sm' });
			$.reset(button);
			$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Hide, and don't show tips again");

			var div_1 = $.sibling(button, 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_2 = $.child(div_3);

			Icon(node_2, {
				get name() {
					return $.get(currentTip).icon;
				},
				size: 'md'
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var h3 = $.child(div_4);
			var text = $.only_child(h3);
			var p = $.sibling(h3, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div_4);
			$.reset(div_2);

			var div_5 = $.sibling(div_2, 2);
			var button_1 = $.child(div_5);
			var node_3 = $.child(button_1);

			Icon(node_3, { name: 'arrow-left', size: 'sm' });
			$.reset(button_1);

			var button_2 = $.sibling(button_1, 2);
			var node_4 = $.child(button_2);

			Icon(node_4, { name: 'arrow-right', size: 'sm' });
			$.reset(button_2);
			$.reset(div_5);
			$.reset(div_1);

			var div_6 = $.sibling(div_1, 2);

			$.each(div_6, 21, () => tips, $.index, ($$anchor, _, index) => {
				var button_3 = root();
				let classes;

				$.set_attribute(button_3, 'aria-label', `Go to tip ${index + 1}`);
				$.template_effect(() => classes = $.set_class(button_3, 1, 'dot svelte-nj9t3c', null, classes, { active: index === $.get(currentTipIndex) }));
				$.delegated('click', button_3, () => $.set(currentTipIndex, index, true));
				$.append($$anchor, button_3);
			});

			$.reset(div_6);
			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, `Tip: ${$.get(currentTip).title ?? ''}`);
				$.set_text(text_1, $.get(currentTip).description);
			});

			$.delegated('click', button, dismissTips);
			$.delegated('click', button_1, previousTip);
			$.delegated('click', button_2, nextTip);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);