import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { platform } from '@tauri-apps/plugin-os';
import { Kbd } from './ui/kbd';

var root = $.from_html(`<div class="flex gap-0.5"></div>`);

export default function KeyboardShortcut($$anchor, $$props) {
	$.push($$props, true);

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

	const symbols = [...$$props.shortcut.modifiers].sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b)).map((modifier) => modifierMap[modifier]).concat(keyMap[$$props.shortcut.key] ?? $$props.shortcut.key.charAt(0).toUpperCase() + $$props.shortcut.key.slice(1));
	var div = root();

	$.each(div, 21, () => symbols, $.index, ($$anchor, symbol) => {
		Kbd($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(symbol)));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}