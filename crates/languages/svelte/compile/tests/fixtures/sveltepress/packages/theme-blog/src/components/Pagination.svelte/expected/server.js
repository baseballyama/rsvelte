import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { paginationWindow } from '../pagination.js';

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { page, total, pageSize } = $$props;
		const totalPages = $.derived(() => Math.max(1, Math.ceil(total / pageSize)));
		const items = $.derived(() => paginationWindow(page, totalPages()));

		function href(n) {
			return n === 1 ? `${base}/` : `${base}/page/${n}/`;
		}

		if (totalPages() > 1) {
			$$renderer.push(`<!--[0--><nav class="sp-pg svelte-1i0lfv7" aria-label="Pagination">`);

			if (page > 1) {
				$$renderer.push(`<!--[0--><a class="sp-pg__nav svelte-1i0lfv7"${$.attr('href', href(page - 1))}>← Prev</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array = $.ensure_array_like(items());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let it = each_array[$$index];

				if (it === '…') {
					$$renderer.push(`<!--[0--><span class="sp-pg__sep svelte-1i0lfv7">…</span>`);
				} else {
					$$renderer.push(`<!--[-1--><a${$.attr_class('sp-pg__num svelte-1i0lfv7', void 0, { 'is-active': it === page })}${$.attr('href', href(it))}${$.attr('aria-current', it === page ? 'page' : undefined)}>${$.escape(it)}</a>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> `);

			if (page < totalPages()) {
				$$renderer.push(`<!--[0--><a class="sp-pg__nav svelte-1i0lfv7"${$.attr('href', href(page + 1))}>Next →</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}