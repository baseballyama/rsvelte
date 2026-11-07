import * as $ from 'svelte/internal/server';

export default function Integration_cardv8($$renderer, $$props) {
	let {
		name,
		icon: Icon,
		description,
		link = "https://github.com/SikandarJODD/cnblocks"
	} = $$props;

	$$renderer.push(`<div class="space-y-4 rounded-lg border p-4 transition-colors hover:bg-muted dark:hover:bg-muted/50"><div class="flex size-fit items-center justify-center">`);

	if (Icon) {
		$$renderer.push('<!--[-->');
		Icon($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div> <div class="space-y-1"><h3 class="text-sm font-medium">${$.escape(name)}</h3> <p class="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2">${$.escape(description)}</p></div></div>`);
}