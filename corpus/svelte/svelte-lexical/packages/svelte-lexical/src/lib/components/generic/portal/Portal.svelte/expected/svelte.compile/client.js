import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from 'svelte';

var root = $.from_html(`<div><!></div>`);

export default function Portal($$anchor, $$props) {
	$.push($$props, true);

	let target = $.prop($$props, 'target', 19, () => globalThis.document?.body),
		portalRef = $.prop($$props, 'portalRef', 15);

	onMount(() => {
		if (target()) {
			target().appendChild(portalRef());
		}
	});

	onDestroy(() => {
		if (portalRef()?.parentNode) {
			portalRef().parentNode?.removeChild(portalRef());
		}
	});

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => portalRef($$value), () => portalRef());
	$.append($$anchor, div);
	$.pop();
}