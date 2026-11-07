import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { notesStore } from './notesStore.svelte';

var root = $.from_html(`<div class="overlay svelte-1fqbcn2" role="presentation"><div class="dialog svelte-1fqbcn2" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="dialog-header svelte-1fqbcn2"><h2 id="settings-title" class="svelte-1fqbcn2">Settings</h2> <button class="close-btn svelte-1fqbcn2" aria-label="Close">×</button></div> <div class="dialog-body svelte-1fqbcn2"><label class="field-label svelte-1fqbcn2" for="notes-path">Notes location</label> <div class="path-row svelte-1fqbcn2"><input id="notes-path" class="path-input svelte-1fqbcn2" readonly=""/> <button class="copy-btn svelte-1fqbcn2"> </button></div></div></div></div>`);

export default function Settings($$anchor, $$props) {
	$.push($$props, true);

	let copied = $.state(false);

	async function copyPath() {
		await navigator.clipboard.writeText(notesStore.notesDir);
		$.set(copied, true);
		setTimeout(() => $.set(copied, false), 1500);
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') $$props.onClose();
	}

	var div = root();

	$.event('keydown', $.window, handleKeydown);

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var button = $.sibling($.child(div_2), 2);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var input = $.child(div_4);

	$.remove_input_defaults(input);

	var button_1 = $.sibling(input, 2);
	var text = $.only_child(button_1, true);

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_value(input, notesStore.notesDir);
		$.set_text(text, $.get(copied) ? 'Copied!' : 'Copy');
	});

	$.delegated('click', div, (e) => {
		if (e.target === e.currentTarget) $$props.onClose();
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onClose?.apply(this, $$args);
	});

	$.delegated('click', button_1, copyPath);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);