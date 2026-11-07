import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { InlineCalendar, themes } from '../../index';

var root = $.from_html(`<!> <p>Not your cup of tea? <a>Design your own theme.</a></p>`, 1);

export default function DarkTheme($$anchor) {
	const { dark: theme } = themes;
	var fragment = root();
	var node = $.first_child(fragment);

	InlineCalendar(node, {
		get theme() {
			return theme;
		}
	});

	var p = $.sibling(node, 2);
	var a = $.sibling($.child(p));

	$.reset(p);
	$.template_effect(() => $.set_attribute(a, 'href', `${base ?? ''}/docs/theme-editor/light`));
	$.append($$anchor, fragment);
}