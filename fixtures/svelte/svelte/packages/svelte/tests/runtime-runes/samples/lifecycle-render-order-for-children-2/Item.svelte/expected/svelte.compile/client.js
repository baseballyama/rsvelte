import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	function logRender() {
		console.log(`${$$props.index}: render ${$$props.n}`);

		return $$props.index;
	}

	$.user_pre_effect(() => {
		console.log(`${$$props.index}: $effect.pre ${$$props.n}`);
	});

	$.user_pre_effect(() => {
		console.log(`${$$props.index}: $effect.pre (2) ${$$props.n}`);
	});

	$.user_effect(() => {
		console.log(`${$$props.index}: $effect ${$$props.n}`);
	});

	var li = root();
	var text = $.only_child(li, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => logRender()]);
	$.append($$anchor, li);
	$.pop();
}