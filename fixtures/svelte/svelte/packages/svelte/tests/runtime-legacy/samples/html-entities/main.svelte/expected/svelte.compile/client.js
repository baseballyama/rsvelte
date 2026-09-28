import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>&ast;</span> <span>&midast;</span> <span>&#x0002A;</span> <span>&#x0002A</span> <span>&#X0002A;</span> <span>&#42;</span> <span></span> <span>&#65;</span> <span>&#128;</span> <span>&#128</span> <span>&stringnotanentity;</span> <span>different &rect and &rect;</span> <span>&copyotherstring</span> <span>&copy=otherstring</span> <span>&copy;=otherstring</span> <span>&copy123</span> <span>&#x9fotherstring</span>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(32);
	$.append($$anchor, fragment);
}