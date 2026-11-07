import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const textSnip = ($$anchor, text = $.noop) => {
	var code = root();
	var text_1 = $.only_child(code, true);

	$.template_effect(() => $.set_text(text_1, text()));
	$.append($$anchor, code);
};

var root = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);

export default function RoundedCode($$anchor, $$props) {
	textSnip($$anchor, () => $$props.text);
}