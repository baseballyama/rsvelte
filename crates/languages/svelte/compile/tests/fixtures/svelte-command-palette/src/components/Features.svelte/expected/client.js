import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="card feature-card svelte-84hc0p"><div class="feature-icon svelte-84hc0p"> </div> <h3 class="svelte-84hc0p"> </h3> <p class="svelte-84hc0p"> </p></div>`);
var root_1 = $.from_html(`<section class="features section svelte-84hc0p"><div class="container"><div class="features-header svelte-84hc0p"><span class="badge svelte-84hc0p">Features</span> <h2 class="svelte-84hc0p">Everything you need,<br/>nothing you don't</h2> <p class="svelte-84hc0p">Built with developer experience in mind. Get up and running in minutes.</p></div> <div class="feature-grid"></div></div></section>`);

export default function Features($$anchor) {
	const features = [
		{
			icon: '⌨️',
			title: 'Keyboard First',
			description: 'Full keyboard navigation with customizable shortcuts. Works seamlessly with your existing keybindings.'
		},

		{
			icon: '🔍',
			title: 'Fuzzy Search',
			description: 'Powered by Fuse.js for intelligent, typo-tolerant search across titles, descriptions, and keywords.'
		},

		{
			icon: '🎨',
			title: 'Fully Customizable',
			description: 'Style every element with CSS classes or inline styles. Or go completely unstyled for total control.'
		},

		{
			icon: '♿',
			title: 'Accessible',
			description: 'ARIA compliant with focus management, screen reader support, and keyboard trap handling.'
		},

		{
			icon: '📦',
			title: 'Lightweight',
			description: 'Only ~5KB gzipped with zero dependencies besides Svelte itself. No bloat, just features.'
		},

		{
			icon: '🔷',
			title: 'TypeScript Ready',
			description: 'Written in TypeScript with full type definitions. Enjoy autocomplete and type safety.'
		}
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => features, $.index, ($$anchor, feature) => {
		var div_2 = root();
		var div_3 = $.child(div_2);
		var text = $.only_child(div_3, true);
		var h3 = $.sibling(div_3, 2);
		var text_1 = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_2 = $.only_child(p, true);

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text, $.get(feature).icon);
			$.set_text(text_1, $.get(feature).title);
			$.set_text(text_2, $.get(feature).description);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}