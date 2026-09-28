import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="coming-soon-card"><span class="coming-soon-tag">Coming soon</span> <h3 style="margin:0;font-size:1.4rem;color:var(--text-primary);font-weight:700;"> </h3> <p style="margin:0;max-width:42ch;line-height:1.55;">This component hasn't been ported to Svelte yet. svelte-bits is being built incrementally —
		check back soon, or <a href="https://github.com/DavidHDev/svelte-bits" target="_blank" rel="noreferrer" style="color:var(--color-accent);text-decoration:underline;">contribute on GitHub</a>.</p></div>`);

export default function ComingSoon($$anchor, $$props) {
	var div = root();
	var h3 = $.sibling($.child(div), 2);
	var text = $.only_child(h3, true);

	$.next(2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.name));
	$.append($$anchor, div);
}