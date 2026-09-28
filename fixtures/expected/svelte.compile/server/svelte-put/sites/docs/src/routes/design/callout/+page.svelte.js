import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
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

	$$renderer.push(`<main class="mx-auto max-w-5xl space-y-10 p-10"><!--[-->`);

	const each_array = $.ensure_array_like(status_modifiers);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let css = each_array[$$index];

		$$renderer.push(`<p${$.attr_class(`c-callout ${$.stringify(css)}`)}>This is a sample “callout” that enhances a text block with some contextual meaning.	It is used in blog posts to better draw user attention. See real usage at this blog post	“Productive Dark Mode with SvelteKit, PostCSS, and TailwindCSS (Behind the Screen)”</p>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(icon_modifiers);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let css = each_array_1[$$index_1];

		$$renderer.push(`<p${$.attr_class(`c-callout ${$.stringify(css)}`)}>This is a sample “callout” that enhances a text block with some contextual meaning.	It is used in blog posts to better draw user attention. See real usage at this blog post	“Productive Dark Mode with SvelteKit, PostCSS, and TailwindCSS (Behind the Screen)”</p>`);
	}

	$$renderer.push(`<!--]--></main>`);
}