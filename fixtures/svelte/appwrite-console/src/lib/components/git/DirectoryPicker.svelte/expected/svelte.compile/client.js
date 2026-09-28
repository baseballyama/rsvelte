import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createTreeView } from '@melt-ui/svelte';
import { onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import DirectoryItem from '$lib/components/git/DirectoryItem.svelte';
import { Spinner } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<div class="loading-container svelte-jppdg6"><!><span>Loading directory data...</span></div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function DirectoryPicker($$anchor, $$props) {
	$.push($$props, true);

	const $tree = () => $.store_get(tree, '$tree', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let expanded = $.prop($$props, 'expanded', 27, () => $.proxy(writable(['lib-0', 'tree-0']))),
		selected = $.prop($$props, 'selected', 15, undefined),
		isLoading = $.prop($$props, 'isLoading', 3, true);

	const ctx = createTreeView({ expanded: expanded() });

	setContext('tree', ctx);

	const { elements: { tree } } = ctx;
	let rootContainer = $.state(undefined);
	let containerWidth = $.state(undefined);
	let internalSelected = $.state(undefined);

	$.user_effect(() => {
		$.set(internalSelected, selected(), true);
	});

	onMount(() => {
		updateWidth();

		if ($$props.openTo) {
			const pathSegments = $$props.openTo.split('/').filter(Boolean);
			const pathsToExpand = [];
			let currentPath = '';

			for (const segment of pathSegments) {
				currentPath += '/' + segment;
				pathsToExpand.push(currentPath);
			}

			if (pathsToExpand.length > 0) {
				expanded()?.update((current) => {
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
		$.set(
			containerWidth,
			$.get(rootContainer)
				? $.get(rootContainer).getBoundingClientRect().width
				: undefined,
			true
		);
	}

	function handleSelect(detail) {
		$.set(internalSelected, detail.fullPath, true);
		selected($.get(internalSelected));

		if ($$props.onChange) $$props.onChange({ fullPath: detail.fullPath });
		if ($$props.onSelect) $$props.onSelect(detail);
	}

	$.user_effect(() => {
		$.set(
			containerWidth,
			$.get(rootContainer)
				? $.get(rootContainer).getBoundingClientRect().width
				: undefined,
			true
		);
	});

	var div = root_1();

	$.event('resize', $.window, updateWidth);

	$.attribute_effect(
		div,
		() => ({
			class: 'directory-container',
			...$tree(),
			[$.CLASS]: { isLoading: isLoading() }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-jppdg6'
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, {});
			$.next();
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			DirectoryItem($$anchor, {
				get directories() {
					return $$props.directories;
				},

				get containerWidth() {
					return $.get(containerWidth);
				},

				get selectedPath() {
					return $.get(internalSelected);
				},
				onSelect: handleSelect
			});
		};

		$.if(node, ($$render) => {
			if (isLoading()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(rootContainer, $$value), () => $.get(rootContainer));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}