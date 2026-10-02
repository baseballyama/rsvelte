import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HintedText from './HintedText.svelte';

const hint = ($$anchor) => {
	var span = root();

	$.append($$anchor, span);
};

var root = $.from_html(`<span class="m-0">Built with ♡ using <code>@svelte-put/popover</code> and <code>@floating-ui</code></span>`);
var root_1 = $.from_html(`<p class="m-0"><span>Hover on</span> <!> <span>for some hinting action (or focus it using keyboard).</span></p>`);

export default function Usage($$anchor) {
	var p = root_1();
	var node = $.sibling($.child(p), 2);

	HintedText(node, {
		get hint() {
			return hint;
		},
		class: 'hl-info cursor-help',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('this text ⓘ');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(p);
	$.append($$anchor, p);
}