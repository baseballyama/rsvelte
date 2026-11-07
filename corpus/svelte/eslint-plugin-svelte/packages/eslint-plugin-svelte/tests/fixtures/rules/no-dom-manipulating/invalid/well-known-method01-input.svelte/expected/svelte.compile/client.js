import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div></div> div</div> <button>Click Me</button>`, 1);

export default function Well_known_method01_input($$anchor) {
	let foo;
	let div;

	const update = () => {
		const newNode = document.createElement('div');

		div.appendChild(newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
		div.insertBefore(newNode, foo); // https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
		div.normalize(); // https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize
		div.removeChild(foo); // https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
		div.replaceChild(newNode, foo); // https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild
		div.after(newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Element/after
		div.append(newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Element/append
		div.before(newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Element/before
		div.insertAdjacentElement('beforebegin', newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
		div.insertAdjacentHTML('beforebegin', '<strong>inserted text</strong>'); // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
		div.insertAdjacentText('beforebegin', 'Foo'); // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentText
		div.prepend(newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend
		div.remove(); // https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
		div.replaceChildren(newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren
		div.replaceWith(newNode); // https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceWith
	};

	var fragment = root();
	var div_1 = $.first_child(fragment);
	var div_2 = $.child(div_1);

	$.bind_this(div_2, ($$value) => foo = $$value, () => foo);
	$.next();
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => div = $$value, () => div);

	var button = $.sibling(div_1, 2);

	$.event('click', button, () => update());
	$.append($$anchor, fragment);
}