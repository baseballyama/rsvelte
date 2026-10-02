import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Link } from "carbon-components-svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

var root = $.from_html(`<!> <!> <!> <p style="color: rgb(10, 20, 30);">Read the <!> documentation.</p> <p style="color: rgb(10, 20, 30);">Read the <!> documentation.</p>`, 1);

export default function LinkFixture($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Link(node, {
		'data-testid': 'link-sm',
		size: 'sm',
		href: 'https://www.carbondesignsystem.com/',
		get icon() {
			return Carbon;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Link(node_1, {
		'data-testid': 'link-md',
		href: 'https://www.carbondesignsystem.com/',
		get icon() {
			return Carbon;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Medium');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Link(node_2, {
		'data-testid': 'link-lg',
		size: 'lg',
		href: 'https://www.carbondesignsystem.com/',
		get icon() {
			return Carbon;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Large');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_2, 2);
	var node_3 = $.sibling($.child(p));

	Link(node_3, {
		'data-testid': 'link-muted',
		muted: true,
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Carbon Design System');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var node_4 = $.sibling($.child(p_1));

	Link(node_4, {
		'data-testid': 'link-default',
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Carbon Design System');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(p_1);
	$.append($$anchor, fragment);
}