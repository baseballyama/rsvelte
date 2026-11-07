import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import logo from '$lib/assets/logo/svelte-bits-logo.svg';
import './LandingLoader.css';

var root = $.from_html(`<div><span class="ln-loader-logo" aria-hidden="true"><img alt=""/></span></div>`);

export default function LandingLoader($$anchor, $$props) {
	let hiding = $.prop($$props, 'hiding', 3, false);
	var div = root();
	var span = $.child(div);
	var img = $.only_child(span);

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `ln-loader ${hiding() ? 'ln-loader--hide' : ''}`);
		$.set_attribute(img, 'src', logo);
	});

	$.append($$anchor, div);
}