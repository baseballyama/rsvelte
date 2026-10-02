import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="my-6 w-full overflow-y-auto"><table class="w-full"><thead><tr class="m-0 border-t p-0 even:bg-muted"><th class="border px-4 py-2 text-start font-bold [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">King's Treasury</th><th class="border px-4 py-2 text-start font-bold [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">People's happiness</th></tr></thead><tbody><tr class="m-0 border-t p-0 even:bg-muted"><td class="border px-4 py-2 text-start [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">Empty</td><td class="border px-4 py-2 text-start [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">Overflowing</td></tr><tr class="m-0 border-t p-0 even:bg-muted"><td class="border px-4 py-2 text-start [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">Modest</td><td class="border px-4 py-2 text-start [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">Satisfied</td></tr><tr class="m-0 border-t p-0 even:bg-muted"><td class="border px-4 py-2 text-start [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">Full</td><td class="border px-4 py-2 text-start [&amp;[align=center]]:text-center [&amp;[align=right]]:text-end">Ecstatic</td></tr></tbody></table></div>`);

export default function Typography_table($$anchor) {
	var div = root();

	$.append($$anchor, div);
}