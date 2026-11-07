import * as $ from 'svelte/internal/server';
import { createTreeView } from '@melt-ui/svelte';
import { onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import DirectoryItem from '$lib/components/git/DirectoryItem.svelte';
import { Spinner } from '@appwrite.io/pink-svelte';

export default function DirectoryPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			expanded = writable(['lib-0', 'tree-0']),
			selected = undefined,
			openTo,
			directories,
			isLoading = true,
			onSelect,
			onChange
		} = $$props;

		const ctx = createTreeView({ expanded });

		setContext('tree', ctx);

		const { elements: { tree } } = ctx;
		let rootContainer = undefined;
		let containerWidth = undefined;
		let internalSelected = undefined;

		onMount(() => {
			updateWidth();

			if (openTo) {
				const pathSegments = openTo.split('/').filter(Boolean);
				const pathsToExpand = [];
				let currentPath = '';

				for (const segment of pathSegments) {
					currentPath += '/' + segment;
					pathsToExpand.push(currentPath);
				}

				if (pathsToExpand.length > 0) {
					expanded?.update((current) => {
						const next = [...current];

						pathsToExpand.forEach((path) => {
							if (!next.includes(path)) {
								next.push(path);
							}
						});

						return next;
					});
				}
			}
		});

		function updateWidth() {
			containerWidth = rootContainer
				? rootContainer.getBoundingClientRect().width
				: undefined;
		}

		function handleSelect(detail) {
			internalSelected = detail.fullPath;
			selected = internalSelected;

			if (onChange) onChange({ fullPath: detail.fullPath });
			if (onSelect) onSelect(detail);
		}

		$$renderer.push(`<div${$.attributes(
			{
				class: 'directory-container',
				...$.store_get($$store_subs ??= {}, '$tree', tree)
			},
			'svelte-jppdg6',
			{ isLoading }
		)}>`);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="loading-container svelte-jppdg6">`);
			Spinner($$renderer, {});
			$$renderer.push(`<!----><span>Loading directory data...</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			DirectoryItem($$renderer, {
				directories,
				containerWidth,
				selectedPath: internalSelected,
				onSelect: handleSelect
			});
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { expanded, selected });
	});
}