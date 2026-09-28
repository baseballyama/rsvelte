import * as $ from 'svelte/internal/server';
import { platform } from '@tauri-apps/plugin-os';
import { Kbd } from './ui/kbd';

export default function KeyboardShortcut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { shortcut } = $$props;
		const macModifierMap = { cmd: '⌘', ctrl: '⌃', opt: '⌥', shift: '⇧' };
		const standardModifierMap = { cmd: 'Ctrl', ctrl: 'Ctrl', opt: 'Alt', shift: 'Shift' };
		const modifierMap = platform() === 'macos' ? macModifierMap : standardModifierMap;
		const modifierOrder = ['ctrl', 'opt', 'shift', 'cmd'];

		const keyMap = {
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

		const symbols = [...shortcut.modifiers].sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b)).map((modifier) => modifierMap[modifier]).concat(keyMap[shortcut.key] ?? shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1));

		$$renderer.push(`<div class="flex gap-0.5"><!--[-->`);

		const each_array = $.ensure_array_like(symbols);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let symbol = each_array[$$index];

			Kbd($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(symbol)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);
	});
}