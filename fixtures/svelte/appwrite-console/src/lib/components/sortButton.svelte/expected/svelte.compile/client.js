import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Query } from '@appwrite.io/console';
import { Button } from '$lib/elements/forms';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconChevronDown, IconChevronUp, IconSelector } from '@appwrite.io/pink-icons-svelte';

export default function SortButton($$anchor, $$props) {
	$.push($$props, true);

	const $state = () => $.store_get($$props.state, '$state', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let onSort = $.prop($$props, 'onSort', 3, () => {}),
		disabled = $.prop($$props, 'disabled', 3, false);

	function sort() {
		const isCurrent = $state().column === $$props.column;

		const nextDir = !isCurrent
			? 'asc'
			: $state().direction === 'asc'
				? 'desc'
				: $state().direction === 'desc' ? 'default' : 'asc';

		$$props.state?.set({
			direction: nextDir,
			column: nextDir === 'default' ? null : $$props.column
		});

		if (nextDir === 'default') {
			onSort()?.(null);
		} else if (nextDir === 'asc') {
			onSort()?.(Query.orderAsc($$props.column));
		} else {
			onSort()?.(Query.orderDesc($$props.column));
		}
	}

	const direction = $.derived(() => $state()?.column === $$props.column && $state()?.direction !== 'default' ? $state()?.direction : '');

	Button($$anchor, {
		extraCompact: true,
		get class() {
			return `hoverable-compact ${$.get(direction) ?? ''}`;
		},

		get disabled() {
			return disabled();
		},
		$$events: { click: sort },
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => $state()?.column !== $$props.column || $state()?.direction === 'default'
					? IconSelector
					: $state()?.direction === 'asc' ? IconChevronUp : IconChevronDown);

				Icon($$anchor, {
					size: 's',
					get icon() {
						return $.get($0);
					},
					color: '--fgcolor-neutral-weak'
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}