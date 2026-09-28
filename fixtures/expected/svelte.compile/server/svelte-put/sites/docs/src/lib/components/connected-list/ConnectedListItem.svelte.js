import * as $ from 'svelte/internal/server';

export default function ConnectedListItem($$renderer, $$props) {
	let {
		line = true,
		class: cls,
		children,
		$$slots,
		$$events,
		...rest
	} = $$props;

	$$renderer.push(`<li${$.attributes(
		{
			class: `group flex items-baseline space-x-4 ${$.stringify(cls)}`,
			...rest
		},
		'svelte-wud7kk'
	)}><div class="mt-0 flex flex-col items-center self-stretch"><p class="connected-step bg-primary-bg text-primary-fg grid h-7 w-7 place-items-center rounded-full text-xs font-bold svelte-wud7kk"></p> `);

	if (line) {
		$$renderer.push(`<!--[0--><div class="bg-primary-bg/75 min-h-[1rem] w-0.5 flex-1 group-last:hidden"></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> <div class="mb-4">`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div></li>`);
}