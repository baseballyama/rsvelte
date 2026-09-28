import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { browser } from '$app/environment';
import { accessibility } from '$lib/stores/accessibility';
import { theme } from '$lib/stores/theme';
import { navbarDisplay } from '$lib/stores/navbarDisplay';
import { homepageLayout } from '$lib/stores/homepageLayout';
import SettingsPanel from '$lib/components/furniture/SettingsPanel.svelte';

var root = $.from_html(`<div class="settings-menu svelte-cfx6oj"><button class="action-button settings-trigger svelte-cfx6oj" aria-label="Open Settings" aria-haspopup="menu"><!></button> <!></div>`);

export default function SettingsMenu($$anchor, $$props) {
	$.push($$props, true);

	let isOpen = $.state(false);
	let menuRef = $.state(void 0);
	let triggerRef = $.state(void 0);

	// Shortcut key detection
	const isMac = browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

	const shortcutKey = isMac ? '⌘' : 'Ctrl';

	// Handle clicks outside menu
	function handleClickOutside(event) {
		if ($.get(isOpen) && $.get(menuRef) && !$.get(menuRef).contains(event.target) && !$.get(triggerRef)?.contains(event.target)) {
			$.set(isOpen, false);
		}
	}

	// Handle escape key
	function handleKeydown(event) {
		if (event.key === 'Escape' && $.get(isOpen)) {
			$.set(isOpen, false);
			$.get(triggerRef)?.focus();
		}
	}

	// Handle global keyboard shortcuts
	function handleGlobalKeydown(event) {
		if ((event.metaKey || event.ctrlKey) && event.key === ',') {
			event.preventDefault();
			$.set(isOpen, !$.get(isOpen));
		}
	}

	// Handle close from panel
	function handleClose() {
		$.set(isOpen, false);
	}

	// Handle double-click to navigate to settings page
	function handleDoubleClick() {
		goto('/settings');
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('keydown', handleGlobalKeydown);

		// Initialize stores
		accessibility.init();

		theme.init();
		navbarDisplay.init();
		homepageLayout.init();

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	var div = root();
	var button = $.child(div);
	var node = $.child(button);

	Icon(node, { name: 'settings2', size: 'sm' });
	$.reset(button);
	$.bind_this(button, ($$value) => $.set(triggerRef, $$value), () => $.get(triggerRef));
	$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Settings (${shortcutKey}+,)`);

	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			SettingsPanel($$anchor, { onClose: handleClose });
		};

		$.if(node_1, ($$render) => {
			if ($.get(isOpen)) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(menuRef, $$value), () => $.get(menuRef));
	$.template_effect(() => $.set_attribute(button, 'aria-expanded', $.get(isOpen)));
	$.delegated('click', button, () => $.set(isOpen, !$.get(isOpen)));
	$.delegated('dblclick', button, handleDoubleClick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'dblclick']);