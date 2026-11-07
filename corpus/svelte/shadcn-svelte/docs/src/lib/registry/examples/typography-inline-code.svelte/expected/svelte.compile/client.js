import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">@lucide/svelte</code>`);

export default function Typography_inline_code($$anchor) {
	var code = root();

	$.append($$anchor, code);
}