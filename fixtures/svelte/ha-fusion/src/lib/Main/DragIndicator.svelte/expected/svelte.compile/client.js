import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { lang, motion } from '$lib/Stores';
import { scale } from 'svelte/transition';
import Icon from '@iconify/svelte';

var root = $.from_html(`<div class="svelte-4zcatm"><div class="icon svelte-4zcatm"><!></div></div>`);

export default function DragIndicator($$anchor, $$props) {
	$.push($$props, true);

	const $motion = () => $.store_get(motion, '$motion', $$stores);
	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Icon(node, { icon: 'mdi:drag', height: 'none' });
	$.reset(div_1);
	$.reset(div);
	$.template_effect(($0) => $.set_attribute(div, 'title', $0), [() => $lang()('drag_and_drop')]);
	$.transition(3, div, () => scale, () => ({ start: 0.9, duration: $motion() }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}