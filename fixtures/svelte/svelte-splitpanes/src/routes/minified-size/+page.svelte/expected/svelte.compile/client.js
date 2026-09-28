import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asset } from '$app/paths';

var root = $.from_html(`<img alt="Minified Size"/> <p>The badge above shows the minimized size of the library when all features are used. <br/> Please note, the size includes type definitions, styles and components.</p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var img = $.first_child(fragment);

	$.next(2);
	$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => asset('/minified-size-badge.svg')]);
	$.append($$anchor, fragment);
	$.pop();
}