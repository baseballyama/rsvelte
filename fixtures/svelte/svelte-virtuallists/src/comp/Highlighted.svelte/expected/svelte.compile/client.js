import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<pre><code class="hljs"></code></pre>`);

export default function Highlighted($$anchor, $$props) {
	var // Based on https://github.com/metonym/svelte-highlight/blob/master/src/LangTag.svelte
	pre = root();

	var code = $.child(pre);

	$.html(code, () => $$props.highlighted, true);
	$.reset(code);
	$.reset(pre);
	$.template_effect(() => $.set_attribute(pre, 'data-language', $$props.lang));
	$.append($$anchor, pre);
}