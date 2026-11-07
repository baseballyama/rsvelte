import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentWindow from '$lib/ComponentWindow.svelte';
import NewsletterForm from '$/lib/newsletter/NewsletterForm.svelte';

var root = $.from_html(`<!> <div class="content"><iframe scrolling="no" src="/embed/600" title="Show Embed" style="width: 100%; height: 230px; max-width: 1200px; border: 1px solid black"></iframe></div>`, 1);

export default function _page($$anchor) {
	const comp = NewsletterForm;
	var fragment = root();
	var node = $.first_child(fragment);

	ComponentWindow(node, {
		get Component() {
			return comp;
		}
	});

	$.next(2);
	$.append($$anchor, fragment);
}