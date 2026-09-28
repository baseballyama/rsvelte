import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { thumbnail } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'selected', 'class']);
var root = $.from_html(`<img/>`);

export default function Thumbnail($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("thumbnail"));
	var img = root();

	$.attribute_effect(img, ($0) => ({ ...restProps, class: $0 }), [
		() => thumbnail({
			selected: $$props.selected,
			class: clsx($.get(theme), $$props.class)
		})
	]);

	$.replay_events(img);
	$.append($$anchor, img);
	$.pop();
}