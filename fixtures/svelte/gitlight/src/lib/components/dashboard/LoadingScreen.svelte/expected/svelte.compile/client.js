import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AnimatedLogo, DragRegion } from '$lib/components';

var root = $.from_html(`<!> <section class="container svelte-xcf0tf"><!> <div class="text-container svelte-xcf0tf"><h2 class="title svelte-xcf0tf">Loading your data...</h2> <p class="subtitle svelte-xcf0tf">This can take a bit of time.</p></div> <div class="loading-line svelte-xcf0tf"></div></section>`, 1);

export default function LoadingScreen($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	DragRegion(node, {});

	var section = $.sibling(node, 2);
	var node_1 = $.child(section);

	AnimatedLogo(node_1, {});
	$.next(4);
	$.reset(section);
	$.append($$anchor, fragment);
}