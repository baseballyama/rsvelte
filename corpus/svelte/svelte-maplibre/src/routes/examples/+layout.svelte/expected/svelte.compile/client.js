import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';

var root = $.from_html(`<div class="mx-auto flex w-11/12 flex-col items-center"><h1 class="mb-4"> </h1> <!> <p><a href="/">Back to Examples</a></p> <p><a href="https://github.com/dimfeld/svelte-maplibre">Github</a></p></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root();
	var h1 = $.child(div);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.next(4);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $page().data.title));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}