import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A spot for the rows per page selector or indicator.
		 */
		/**
		 * A spot for the count and total count.
		 */
		let {
			use = [],
			class: className = '',
			trailing$use = [],
			trailing$class = '',
			children,
			rowsPerPage,
			total,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		setContext('SMUI:label:context', 'data-table:pagination');
		setContext('SMUI:select:context', 'data-table:pagination');
		setContext('SMUI:icon-button:context', 'data-table:pagination');

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({ 'mdc-data-table__pagination': true, [className]: true })),
			...exclude(restProps, ['trailing$'])
		})}><div${$.attributes({
			class: $.clsx(classMap({
				'mdc-data-table__pagination-trailing': true,
				[trailing$class]: true
			})),
			...prefixFilter(restProps, 'trailing$')
		})}>`);

		if (rowsPerPage) {
			$$renderer.push(`<!--[0--><div class="mdc-data-table__pagination-rows-per-page">`);
			rowsPerPage?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="mdc-data-table__pagination-navigation">`);

		if (total) {
			$$renderer.push(`<!--[0--><div class="mdc-data-table__pagination-total">`);
			total?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div></div>`);
		$.bind_props($$props, { getElement });
	});
}