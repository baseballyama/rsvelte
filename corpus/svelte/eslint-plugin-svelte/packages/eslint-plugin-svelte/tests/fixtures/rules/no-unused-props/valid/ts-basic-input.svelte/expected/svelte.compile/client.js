import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Ts_basic_input($$anchor, $$props) {
	$.push($$props, true);

	var // fix: https://github.com/sveltejs/eslint-plugin-svelte/issues/1028#issuecomment-2728101827
	p = root();

	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${$$props.myObjectProp.value ?? ''} ${$$props.myObjectProp.value2 ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}