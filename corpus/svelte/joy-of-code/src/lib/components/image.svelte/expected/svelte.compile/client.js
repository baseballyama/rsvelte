import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { dev } from '$app/environment';
import { imagesLocal, imagesUrl } from '$lib/site/config';

var root = $.from_html(`<img loading="lazy"/>`);

export default function Image($$anchor, $$props) {
	$.push($$props, true);

	const images = dev ? imagesLocal : imagesUrl;
	const slug = page.params.slug;
	var img = root();

	$.template_effect(() => {
		$.set_attribute(img, 'src', `${images ?? ''}/${slug ?? ''}/images/${$$props.src ?? ''}`);
		$.set_attribute(img, 'alt', $$props.alt);
	});

	$.append($$anchor, img);
	$.pop();
}