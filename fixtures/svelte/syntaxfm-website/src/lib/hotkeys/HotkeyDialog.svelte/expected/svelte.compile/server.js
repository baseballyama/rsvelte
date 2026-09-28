import * as $ from 'svelte/internal/server';
import { clickOutDialog } from '$actions/click_outside_dialog';
import { formatShortcut } from './utils';

export default function HotkeyDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let modal = null;
		let { hotkeys = void 0 } = $$props;

		async function close() {
			modal.close();
		}

		async function toggleModalOpen() {
			if (modal.open) {
				close();
			} else {
				modal.showModal();
			}
		}

		hotkeys['showHideHotkeys'] = {
			description: 'Show / hide this window',
			trigger: { key: '?', callback: toggleModalOpen } //
		};

		const hotkeyNames = Object.keys(hotkeys);

		$$renderer.push(`<dialog class="zone svelte-12p41x1" aria-labelledby="hotkey-header"${$.attr_style('', { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' })}><section aria-label="Hotkey Help Window" class="svelte-12p41x1"><header role="banner" class="svelte-12p41x1"><h3 class="h5" id="hotkey-header">Hotkeys</h3> <button class="close svelte-12p41x1" type="submit">×</button></header> <div class="hotkeys svelte-12p41x1"><!--[-->`);

		const each_array = $.ensure_array_like(hotkeyNames);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let hotkey = each_array[$$index];

			$$renderer.push(`<div class="hotkey-container svelte-12p41x1"><button class="hotkey-key">${$.escape(formatShortcut(hotkeys[hotkey].trigger))}</button> <span class="hotkey-description">${$.escape(hotkeys[hotkey].description)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></section></dialog>`);
		$.bind_props($$props, { hotkeys });
	});
}