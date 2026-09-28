import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Link from "carbon-components-svelte/Link/Link.svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

var root = $.from_html(`<div data-testid="default-link"><!></div> <div data-testid="link-blank"><!></div> <div data-testid="link-inline"><!></div> <div data-testid="link-with-icon"><!></div> <div data-testid="link-with-icon-slot"><!></div> <div data-testid="link-large"><!></div> <div data-testid="link-small"><!></div> <div data-testid="link-small-icon"><!></div> <div data-testid="link-large-icon"><!></div> <div data-testid="link-disabled"><!></div> <div data-testid="link-muted"><!></div> <div data-testid="link-visited"><!></div>`, 1);

export default function Link_test($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Link(node, {
		href: 'https://www.carbondesignsystem.com/',
		$$events: {
			click: (e) => {
				e.preventDefault();
				console.log("click");
			},

			mouseover: () => {
				console.log("mouseover");
			},

			mouseenter: () => {
				console.log("mouseenter");
			},

			mouseleave: () => {
				console.log("mouseleave");
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Carbon Design System');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Link(node_1, {
		href: 'https://www.carbondesignsystem.com/',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Carbon Design System');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Link(node_2, {
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Carbon Design System');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	Link(node_3, {
		href: 'https://www.carbondesignsystem.com/',
		get icon() {
			return Carbon;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Carbon Design System');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	Link(node_4, {
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Carbon Design System');

			$.append($$anchor, text_4);
		},

		$$slots: {
			default: true,
			icon: ($$anchor, $$slotProps) => {
				Carbon($$anchor, {});
			}
		}
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_5 = $.child(div_5);

	Link(node_5, {
		size: 'lg',
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Carbon Design System');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_6 = $.child(div_6);

	Link(node_6, {
		size: 'sm',
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Carbon Design System');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_7 = $.child(div_7);

	Link(node_7, {
		size: 'sm',
		href: 'https://www.carbondesignsystem.com/',
		get icon() {
			return Carbon;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Carbon Design System');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_8 = $.child(div_8);

	Link(node_8, {
		size: 'lg',
		href: 'https://www.carbondesignsystem.com/',
		get icon() {
			return Carbon;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Carbon Design System');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_9 = $.child(div_9);

	Link(node_9, {
		disabled: true,
		href: 'https://www.carbondesignsystem.com/',
		$$events: { click: () => console.log("disabled-click") },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Carbon Design System');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_10 = $.child(div_10);

	Link(node_10, {
		muted: true,
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Carbon Design System');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_11 = $.child(div_11);

	Link(node_11, {
		visited: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Carbon Design System');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	$.reset(div_11);
	$.append($$anchor, fragment);
}