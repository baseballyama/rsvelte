import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

export const gatheringKey = {};

export default function GatheringRound($$anchor, $$props) {
	$.push($$props, true);
	setContext(gatheringKey, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}