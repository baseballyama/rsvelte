import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutDialog } from '$actions/click_outside_dialog';
import { formatShortcut } from './utils';

var root = $.from_html(`<div class="hotkey-container svelte-12p41x1"><button class="hotkey-key"> </button> <span class="hotkey-description"> </span></div>`);
var root_1 = $.from_html(`<dialog class="zone svelte-12p41x1" aria-labelledby="hotkey-header"><section aria-label="Hotkey Help Window" class="svelte-12p41x1"><header role="banner" class="svelte-12p41x1"><h3 class="h5" id="hotkey-header">Hotkeys</h3> <button class="close svelte-12p41x1" type="submit">×</button></header> <div class="hotkeys svelte-12p41x1"></div></section></dialog>`);

export default function HotkeyDialog($$anchor, $$props) {
	$.push($$props, true);

	let modal = $.state(null);
	let hotkeys = $.prop($$props, 'hotkeys', 15);

	async function close() {
		$.get(modal).close();
	}

	async function toggleModalOpen() {
		if ($.get(modal).open) {
			close();
		} else {
			$.get(modal).showModal();
		}
	}

	hotkeys(
		hotkeys()['showHideHotkeys'] = {
			description: 'Show / hide this window',
			trigger: { key: '?', callback: toggleModalOpen } //
		},
		true
	);

	const hotkeyNames = Object.keys(hotkeys());
	var dialog = root_1();

	$.set_style(dialog, '', {}, { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' });

	var section = $.child(dialog);
	var header = $.child(section);
	var button = $.sibling($.child(header), 2);

	$.reset(header);

	var div = $.sibling(header, 2);

	$.each(div, 21, () => hotkeyNames, $.index, ($$anchor, hotkey) => {
		var div_1 = root();
		var button_1 = $.child(div_1);
		var text = $.only_child(button_1, true);
		var span = $.sibling(button_1, 2);
		var text_1 = $.only_child(span, true);

		$.reset(div_1);

		$.template_effect(
			($0) => {
				$.set_text(text, $0);
				$.set_text(text_1, hotkeys()[$.get(hotkey)].description);
			},
			[() => formatShortcut(hotkeys()[$.get(hotkey)].trigger)]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.reset(section);
	$.reset(dialog);
	$.bind_this(dialog, ($$value) => $.set(modal, $$value), () => $.get(modal));
	$.action(dialog, ($$node) => clickOutDialog?.($$node));
	$.event('click-outside', dialog, close);
	$.delegated('click', button, close);
	$.append($$anchor, dialog);
	$.pop();
}

$.delegate(['click']);