import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<span class="flex items-center justify-center rounded-lg bg-yellow px-2 py-0.5"><span class="text-graphite-1000 text-sm font-bold uppercase"> </span></span>`);

export default function BetaLabel($$anchor, $$props) {
	$.push($$props, true);

	var span = root();
	var span_1 = $.child(span);
	var text = $.only_child(span_1, true);

	$.reset(span);
	$.template_effect(($0) => $.set_text(text, $0), [() => s('app.beta')]);
	$.append($$anchor, span);
	$.pop();
}