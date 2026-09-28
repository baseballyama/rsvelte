import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);
var root_1 = $.from_html(`<main class="mx-auto max-w-5xl space-y-10 p-10"><!> <!></main>`);

export default function _page($$anchor) {
	const status_modifiers = [
		'c-callout--info',
		'c-callout--success',
		'c-callout--warning',
		'c-callout--error'
	];

	const icon_modifiers = [
		'c-callout--icon-bulb',
		'c-callout--icon-confetti',
		'c-callout--icon-megaphone',
		'c-callout--icon-question',
		'c-callout--icon-trophy'
	];

	const text = 'This is a sample “callout” that enhances a text block with some contextual meaning.\
	It is used in blog posts to better draw user attention. See real usage at this blog post\
	“Productive Dark Mode with SvelteKit, PostCSS, and TailwindCSS (Behind the Screen)”';
	var main = root_1();
	var node = $.child(main);

	$.each(node, 17, () => status_modifiers, $.index, ($$anchor, css) => {
		var p = root();

		p.textContent = 'This is a sample “callout” that enhances a text block with some contextual meaning.	It is used in blog posts to better draw user attention. See real usage at this blog post	“Productive Dark Mode with SvelteKit, PostCSS, and TailwindCSS (Behind the Screen)”';
		$.template_effect(() => $.set_class(p, 1, `c-callout ${$.get(css) ?? ''}`));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => icon_modifiers, $.index, ($$anchor, css) => {
		var p_1 = root();

		p_1.textContent = 'This is a sample “callout” that enhances a text block with some contextual meaning.	It is used in blog posts to better draw user attention. See real usage at this blog post	“Productive Dark Mode with SvelteKit, PostCSS, and TailwindCSS (Behind the Screen)”';
		$.template_effect(() => $.set_class(p_1, 1, `c-callout ${$.get(css) ?? ''}`));
		$.append($$anchor, p_1);
	});

	$.reset(main);
	$.append($$anchor, main);
}