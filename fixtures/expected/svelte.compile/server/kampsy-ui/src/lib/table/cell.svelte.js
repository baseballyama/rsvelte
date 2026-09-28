import * as $ from 'svelte/internal/server';

export default function Cell($$renderer, $$props) {
	let { class: klass = "", children = undefined } = $$props;

	$$renderer.push(`<td${$.attr_class(`px-2 py-2.5 align-middle last:text-right [&:has([data-cell-link=true])]:p-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${$.stringify(klass)}`)}>`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></td>`);
}