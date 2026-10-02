import * as $ from 'svelte/internal/server';

export default function GridSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { props } = $$props;

		$$renderer.push(`<div class="col-start-1 -col-end-1 -mb-1 flex items-baseline gap-2 pt-2.5"><h3 class="text-xs font-semibold text-gray-500 uppercase">${$.escape(props.title)}</h3> `);

		if (props.subtitle) {
			$$renderer.push(`<!--[0--><p class="text-muted-foreground truncate text-xs">${$.escape(props.subtitle)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}