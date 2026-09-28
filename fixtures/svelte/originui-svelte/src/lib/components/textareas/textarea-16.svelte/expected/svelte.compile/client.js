import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';
import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';

var root = $.from_html(`<div class="space-y-2"><!> <!> <p class="text-muted-foreground mt-2 text-right text-xs" role="status" aria-live="polite"><span class="tabular-nums"> </span> characters left</p></div>`);

export default function Textarea_16($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const maxLength = 180;
	const characterLimit = useCharacterLimit(maxLength);
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Textarea with characters left');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, {
		get id() {
			return uid;
		},

		get maxlength() {
			return characterLimit.maxLength;
		},

		get 'aria-describedby'() {
			return `${uid}-characters-left-textarea`;
		},

		get value() {
			return characterLimit.value;
		},

		set value($$value) {
			characterLimit.value = $$value;
		}
	});

	var p = $.sibling(node_1, 2);
	var span = $.child(p);
	var text_1 = $.only_child(span, true);

	$.next();
	$.reset(p);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(p, 'id', `${uid}-characters-left-textarea`);
		$.set_text(text_1, characterLimit.maxLength - characterLimit.characterCount);
	});

	$.append($$anchor, div);
	$.pop();
}