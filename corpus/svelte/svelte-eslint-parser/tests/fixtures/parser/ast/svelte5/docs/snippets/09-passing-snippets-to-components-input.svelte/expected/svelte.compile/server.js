import * as $ from 'svelte/internal/server';

export default function _9_passing_snippets_to_components_input($$renderer, $$props) {
	let { data, children, row } = $$props;

	$$renderer.push(`<table>`);

	if (children) {
		$$renderer.push(`<!--[0--><thead><tr>`);
		children($$renderer);
		$$renderer.push(`<!----></tr></thead>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></table>`);
}