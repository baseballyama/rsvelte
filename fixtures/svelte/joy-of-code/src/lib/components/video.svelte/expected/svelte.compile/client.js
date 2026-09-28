import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<video controls=""><source type="video/mp4"/></video>`, 2);

export default function Video($$anchor, $$props) {
	$.push($$props, true);

	const images = `https://raw.githubusercontent.com/mattcroat/joy-of-code/main/posts`;
	const slug = page.params.slug;
	var video = root();
	var source = $.only_child(video);

	$.template_effect(() => $.set_attribute(source, 'src', `https://raw.githubusercontent.com/mattcroat/joy-of-code/main/posts/${slug ?? ''}/images/${$$props.src ?? ''}`));
	$.append($$anchor, video);
	$.pop();
}