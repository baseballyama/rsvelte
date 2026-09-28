import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import siteConfig from 'virtual:sveltepress/site';
import { parseImageSrc } from '../utils';

var root = $.from_html(`<div class="hero-image svelte-13xhun5"><img width="192" class="svelte-13xhun5"/></div>`);

export default function HeroImage($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var img = $.only_child(div);

	$.template_effect(
		($0) => {
			$.set_attribute(img, 'src', $0);
			$.set_attribute(img, 'alt', siteConfig.title);
		},
		[() => parseImageSrc($$props.heroImage)]
	);

	$.append($$anchor, div);
	$.pop();
}