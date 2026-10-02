import * as $ from 'svelte/internal/server';
import { Button } from 'svelte-ux';
import LucideGithub from '~icons/lucide/github';
import LucideStar from '~icons/lucide/star';
import LucideSquareArrowOutUpRight from '~icons/lucide/square-arrow-out-up-right';

export default function Showcase($$renderer, $$props) {
	let { sites } = $$props;

	$$renderer.push(`<div class="grid grid-cols-sm gap-3"><!--[-->`);

	const each_array = $.ensure_array_like(sites);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let site = each_array[$$index];

		$$renderer.push(`<div class="flex flex-col border border-primary/20 rounded-lg px-3 py-2 bg-linear-to-b from-primary/8 to-primary/2 backdrop-blur"><a${$.attr('href', site.repourl ?? site.homepageurl)} target="_blank" class="text-lg font-medium">${$.escape(site.name ?? site.reponame)}</a> `);

		if (site.description) {
			$$renderer.push(`<!--[0--><p class="text-sm text-surface-content/50">${$.escape(site.description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="grow flex items-end justify-end gap-1">`);

		if (site.stars) {
			$$renderer.push(`<!--[0--><span class="flex items-center gap-1 text-sm text-surface-content/50 mr-auto">`);
			LucideStar($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> ${$.escape(site.stars.toLocaleString())}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (site.repourl) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				href: site.repourl,
				target: '_blank',
				icon: LucideGithub,
				class: 'size-7 text-surface-content/50 hover:text-surface-content'
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (site.homepageurl) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				href: site.homepageurl,
				target: '_blank',
				icon: LucideSquareArrowOutUpRight,
				class: 'size-7 text-surface-content/50 hover:text-surface-content'
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}