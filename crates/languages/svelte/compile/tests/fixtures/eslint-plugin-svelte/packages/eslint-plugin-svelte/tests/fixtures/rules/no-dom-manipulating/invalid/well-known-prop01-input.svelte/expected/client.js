import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>div</div> <button>Click Me</button>`, 1);

export default function Well_known_prop01_input($$anchor) {
	let div;

	const update = () => {
		div.textContent = ''; // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
		div.innerHTML = ''; // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
		div.outerHTML = ''; // https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
		div.innerText = ''; // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText
		div.outerText = ''; // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText
	};

	var fragment = root();
	var div_1 = $.first_child(fragment);

	$.bind_this(div_1, ($$value) => div = $$value, () => div);

	var button = $.sibling(div_1, 2);

	$.event('click', button, () => update());
	$.append($$anchor, fragment);
}