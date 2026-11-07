import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "@lucide/svelte/icons/check";
import { t } from "$lib/stores/i18n";

var root = $.from_html(`<div class="flex flex-col gap-3 lg:flex-row"><div class="flex min-h-20 w-full flex-row justify-start gap-y-3 rounded-3xl border p-4 lg:w-full lg:min-w-72"><div class="flex w-full flex-row items-center gap-4"><div class="relative flex justify-between"><span class="relative flex size-4"><span></span> <span></span></span></div> <div class="flex min-w-0 flex-col items-start gap-2"><p class="text-xl leading-tight wrap-break-word sm:text-2xl"> </p></div></div></div></div>`);

export default function EventsCard($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	var // Compute change info (direction, color, and formatted value)
	div = root();

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var span = $.child(div_3);
	var span_1 = $.child(span);
	var span_2 = $.sibling(span_1, 2);

	$.reset(span);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var p = $.child(div_4);
	var text = $.only_child(p, true);

	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(span_1, 1, `${$$props.statusClass ?? ''} absolute inline-flex h-full w-full animate-ping rounded-full opacity-75`);
			$.set_class(span_2, 1, `${$$props.statusClass ?? ''} relative inline-flex size-4 rounded-full`);
			$.set_text(text, $0);
		},
		[() => $t()($$props.statusText)]
	);

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}