import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <div class="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50" aria-live="polite" role="status"> </div></div></div>`);

export default function Input_34($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const maxLength = 50;
	const characterLimit = useCharacterLimit(maxLength);
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with character limit');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Input(node_1, {
		get id() {
			return uid;
		},
		class: 'peer pe-14',
		type: 'text',
		get maxlength() {
			return characterLimit.maxLength;
		},

		get 'aria-describedby'() {
			return uid;
		},

		get value() {
			return characterLimit.value;
		},

		set value($$value) {
			characterLimit.value = $$value;
		}
	});

	var div_2 = $.sibling(node_1, 2);
	var text_1 = $.only_child(div_2);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, `${characterLimit.characterCount ?? ''}/${characterLimit.maxLength ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}