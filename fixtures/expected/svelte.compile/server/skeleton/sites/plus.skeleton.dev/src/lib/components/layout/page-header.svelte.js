import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import DecorCorners from './decor-corners.svelte';
import DecorStripes from './decor-stripes.svelte';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

export default function Page_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			title,
			lead,
			description,
			trail,
			class: classes,
			$$slots,
			$$events,
			...rest
		} = $$props;

		function formatLabel(segment) {
			return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
		}

		// Exclude leading paths such as `/content`
		const crumbExclusions = ['content'];

		const crumbs = $.derived(() => {
			const segments = page.url.pathname.split('/').filter((s) => s);
			const withHrefs = segments.map((segment, i) => ({ segment, href: '/' + segments.slice(0, i + 1).join('/') }));
			const visible = withHrefs.filter(({ segment }) => !crumbExclusions.includes(segment));

			return visible.map(({ segment, href }, i) => ({
				label: formatLabel(segment),
				href,
				current: i === visible.length - 1
			}));
		});

		const currentLabel = $.derived(() => crumbs().findLast((c) => c.current)?.label);

		DecorCorners($$renderer, {
			corners: ['bl', 'br'],
			children: ($$renderer) => {
				$$renderer.push(`<header${$.attr_class(`container-cell border-b border-surface-200-800 flex flex-col lg:flex-row lg:items-center gap-4 ${$.stringify(classes)}`)}>`);

				if (lead) {
					$$renderer.push(`<!--[0--><div>`);
					lead($$renderer);
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex-1 space-y-1">`);

				if (crumbs().length > 1) {
					$$renderer.push(`<!--[0--><nav aria-label="Breadcrumb"><ol class="flex items-center gap-2 text-sm"><!--[-->`);

					const each_array = $.ensure_array_like(crumbs());

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let crumb = each_array[i];

						if (i > 0) {
							$$renderer.push(`<!--[0--><li aria-hidden="true">`);
							ChevronRightIcon($$renderer, { class: 'opacity-50 size-elem-sm' });
							$$renderer.push(`<!----></li>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <li>`);

						if (crumb.current) {
							$$renderer.push(`<!--[0--><span aria-current="page">${$.escape(crumb.label)}</span>`);
						} else {
							$$renderer.push(`<!--[-1--><a class="opacity-60 hover:underline"${$.attr('href', crumb.href)}>${$.escape(crumb.label)}</a>`);
						}

						$$renderer.push(`<!--]--></li>`);
					}

					$$renderer.push(`<!--]--></ol></nav>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <h1 class="h1">${$.escape(title ?? currentLabel())}</h1> `);

				if (description) {
					$$renderer.push(`<!--[0--><div class="space-y-2">`);
					description($$renderer);
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (trail) {
					$$renderer.push(`<!--[0--><div class="lg:self-end flex items-center gap-2">`);
					trail($$renderer);
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></header>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		DecorStripes($$renderer, { class: 'h-6' });
		$$renderer.push(`<!---->`);
	});
}