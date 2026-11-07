import * as $ from 'svelte/internal/server';

export default function ConnectedList($$renderer, $$props) {
	let { class: cls, children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<ul${$.attributes(
		{
			class: `prose-p:m-0 prose-ul:m-4 prose-li:m-0 ${$.stringify(cls)}`,
			...rest
		},
		'svelte-1gq0vyn'
	)}>`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></ul>`);
}