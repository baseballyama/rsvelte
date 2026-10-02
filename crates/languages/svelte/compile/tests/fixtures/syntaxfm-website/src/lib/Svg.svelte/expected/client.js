import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img/>`);

export default function Svg($$anchor, $$props) {
	// Pull current specific css var, calculate it's value, pass it as a query param into request.
	// Wave / Grit / Icon
	let fill = $.prop($$props, 'fill', 3, 'var(--accent)');

	let img = $.state(null);
	var img_1 = root();

	$.bind_this(img_1, ($$value) => $.set(img, $$value), () => $.get(img));

	$.template_effect(
		($0, $1) => {
			$.set_attribute(img_1, 'src', `/svg/${$$props.name ?? ''}.svg?${$0 ?? ''}${$1 ?? ''}`);
			$.set_attribute(img_1, 'alt', `${$$props.name ?? ''} icon`);
		},
		[
			() => fill() ? 'f=' + encodeURIComponent(fill()) + '&' : '',
			() => $$props.stroke ? 's=' + encodeURIComponent($$props.stroke) : ''
		]
	);

	$.append($$anchor, img_1);
}