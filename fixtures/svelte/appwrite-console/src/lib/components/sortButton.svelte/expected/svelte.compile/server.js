import * as $ from 'svelte/internal/server';
import { Query } from '@appwrite.io/console';
import { Button } from '$lib/elements/forms';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconChevronDown, IconChevronUp, IconSelector } from '@appwrite.io/pink-icons-svelte';

export default function SortButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { column, state, onSort = () => {}, disabled = false } = $$props;

		function sort() {
			const isCurrent = $.store_get($$store_subs ??= {}, '$state', state).column === column;

			const nextDir = !isCurrent
				? 'asc'
				: $.store_get($$store_subs ??= {}, '$state', state).direction === 'asc'
					? 'desc'
					: $.store_get($$store_subs ??= {}, '$state', state).direction === 'desc' ? 'default' : 'asc';

			state?.set({
				direction: nextDir,
				column: nextDir === 'default' ? null : column
			});

			if (nextDir === 'default') {
				onSort?.(null);
			} else if (nextDir === 'asc') {
				onSort?.(Query.orderAsc(column));
			} else {
				onSort?.(Query.orderDesc(column));
			}
		}

		const direction = $.derived(() => $.store_get($$store_subs ??= {}, '$state', state)?.column === column && $.store_get($$store_subs ??= {}, '$state', state)?.direction !== 'default'
			? $.store_get($$store_subs ??= {}, '$state', state)?.direction
			: '');

		Button($$renderer, {
			extraCompact: true,
			class: `hoverable-compact ${$.stringify(direction())}`,
			disabled,
			children: ($$renderer) => {
				Icon($$renderer, {
					size: 's',
					icon: $.store_get($$store_subs ??= {}, '$state', state)?.column !== column || $.store_get($$store_subs ??= {}, '$state', state)?.direction === 'default'
						? IconSelector
						: $.store_get($$store_subs ??= {}, '$state', state)?.direction === 'asc' ? IconChevronUp : IconChevronDown,
					color: '--fgcolor-neutral-weak'
				});
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}