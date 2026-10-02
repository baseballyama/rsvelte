import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><g transform="translate(0 .047) scale(.93704)" fill="#e31e26"><path d="M34.1 0C15.3 0 0 15.3 0 34.1s15.3 34.1 34.1 34.1C53 68.3 68.3 53 68.3 34.1S53 0 34.1 0zm0 59.3C20.3 59.3 9 48 9 34.1 9 20.3 20.3 9 34.1 9 48 9 59.3 20.3 59.3 34.1 59.3 48 48 59.3 34.1 59.3z"></path><circle cx="42.6" cy="25.6" r="7.1"></circle><circle cx="42.6" cy="42.6" r="7.1"></circle><circle cx="25.6" cy="42.6" r="7.1"></circle><circle cx="25.6" cy="25.6" r="7.1"></circle></g></svg>`);

export default function Twilio($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({ ...props, viewBox: '0 0 64 64' }));
	$.append($$anchor, svg);
}