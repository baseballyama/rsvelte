import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useEmojiPickerFooter } from './emoji-picker.svelte.js';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Emoji_picker_footer($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const footerState = useEmojiPickerFooter();
	var div = root();

	$.attribute_effect(div, ($0) => ({ ...rest, class: $0 }), [
		() => cn('border-border relative max-w-full border-t p-2', $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ active: footerState.root.emojiPickerState.active }));
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}