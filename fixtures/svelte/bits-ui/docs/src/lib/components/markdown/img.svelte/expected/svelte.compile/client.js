import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'src', 'alt']);
var root = $.from_html(`<img/>`);

export default function Img($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var img = root();

	$.attribute_effect(img, ($0) => ({ src: $$props.src, alt: $$props.alt, class: $0, ...restProps }), [() => cn("rounded-md", $$props.class)]);
	$.replay_events(img);
	$.append($$anchor, img);
	$.pop();
}