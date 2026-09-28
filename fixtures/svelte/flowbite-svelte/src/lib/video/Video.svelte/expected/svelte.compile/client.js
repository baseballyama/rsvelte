import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'type',
	'trackSrc',
	'src',
	'srclang',
	'label',
	'class'
]);

var root = $.from_html(`<video><source/> <!> <track kind="captions"/> Your browser does not support the video tag.</video>`, 2);

export default function Video($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, "video/mp4"),
		srclang = $.prop($$props, 'srclang', 3, "en"),
		label = $.prop($$props, 'label', 3, "english_captions"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("span"));
	var video = root();

	$.attribute_effect(video, ($0) => ({ ...restProps, class: $0 }), [() => clsx($.get(theme), $$props.class)]);

	var source = $.child(video);
	var node = $.sibling(source, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	var track = $.sibling(node, 2);

	$.next();
	$.reset(video);

	$.template_effect(() => {
		$.set_attribute(source, 'src', $$props.src);
		$.set_attribute(source, 'type', type());
		$.set_attribute(track, 'src', $$props.trackSrc);
		$.set_attribute(track, 'srclang', srclang());
		$.set_attribute(track, 'label', label());
	});

	$.append($$anchor, video);
	$.pop();
}