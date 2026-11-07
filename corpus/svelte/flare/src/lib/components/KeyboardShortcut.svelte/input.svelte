<script lang="ts">
	import type { KeyboardShortcut } from '$lib/props';
	import { platform } from '@tauri-apps/plugin-os';
	import { Kbd } from './ui/kbd';

	let { shortcut }: { shortcut: KeyboardShortcut } = $props();

	const macModifierMap = {
		cmd: '⌘',
		ctrl: '⌃',
		opt: '⌥',
		shift: '⇧'
	};

	const standardModifierMap = {
		cmd: 'Ctrl',
		ctrl: 'Ctrl',
		opt: 'Alt',
		shift: 'Shift'
	};

	const modifierMap = platform() === 'macos' ? macModifierMap : standardModifierMap;

	const modifierOrder: KeyboardShortcut['modifiers'] = ['ctrl', 'opt', 'shift', 'cmd'];

	const keyMap: Partial<Record<KeyboardShortcut['key'], string>> = {
		return: '⏎',
		enter: '⏎',
		delete: '⌫',
		backspace: '⌫',
		deleteForward: '⌦',
		arrowUp: '↑',
		arrowDown: '↓',
		arrowLeft: '←',
		arrowRight: '→',
		tab: '⇥',
		escape: '⎋',
		space: '␣'
	};

	const symbols = [...shortcut.modifiers]
		.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b))
		.map((modifier) => modifierMap[modifier])
		.concat(keyMap[shortcut.key] ?? shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1));
</script>

<div class="flex gap-0.5">
	{#each symbols as symbol}
		<Kbd>{symbol}</Kbd>
	{/each}
</div>
