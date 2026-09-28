import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#D73A49;--shiki-dark:#CB7676">const</span><span style="color:#005CC5;--shiki-dark:#BD976A"> count</span><span style="color:#D73A49;--shiki-dark:#666666">:</span><span style="color:#005CC5;--shiki-dark:#4C9A91"> 1</span></code></span>`);
var root_1 = $.from_html(`<span>count</span>`);
var root_2 = $.from_html(`<pre class="shiki shiki-themes github-light vitesse-dark twoslash lsp" style="background-color:#fff;--shiki-dark-bg:#121212;color:#24292e;--shiki-dark:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#D73A49;--shiki-dark:#CB7676">const</span><span style="color:#005CC5;--shiki-dark:#BD976A"> </span><span style="color:#005CC5;--shiki-dark:#BD976A"><!></span><span style="color:#D73A49;--shiki-dark:#666666"> =</span><span style="color:#005CC5;--shiki-dark:#4C9A91"> 1</span></span></code></pre>`);

export default function Test_ts($$anchor) {
	var pre = root_2();
	var code = $.child(pre);
	var span = $.child(code);
	var span_1 = $.sibling($.child(span), 2);
	var node = $.child(span_1);

	{
		const floatingContent = ($$anchor) => {
			var span_2 = root();

			$.append($$anchor, span_2);
		};

		Floating(node, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_3 = root_1();

				$.append($$anchor, span_3);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_1);
	$.next(2);
	$.reset(span);
	$.reset(code);
	$.reset(pre);
	$.append($$anchor, pre);
}