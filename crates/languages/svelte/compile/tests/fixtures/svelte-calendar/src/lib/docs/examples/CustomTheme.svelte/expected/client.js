import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InlineCalendar } from '../../index';
import { base } from '$app/paths';

var root = $.from_html(`<!> <p>See <a>theme-editor page</a> to design your own theme.</p>`, 1);

export default function CustomTheme($$anchor) {
	const theme = {
		calendar: { colors: { background: { highlight: 'purple' } } }
	};

	var fragment = root();
	var node = $.first_child(fragment);

	InlineCalendar(node, {
		get theme() {
			return theme;
		}
	});

	var p = $.sibling(node, 2);
	var a = $.sibling($.child(p));

	$.next();
	$.reset(p);
	$.template_effect(() => $.set_attribute(a, 'href', `${base ?? ''}/docs/theme-editor/light`));
	$.append($$anchor, fragment);
}