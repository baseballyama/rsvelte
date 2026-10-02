import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from '$lib/components/ui/dialog';
import BlockPickerPanel from '$lib/components/BlockPickerPanel.svelte';
import { LibrarySymbolEntries, LibrarySymbolFields, LibrarySymbols } from '$lib/pocketbase/collections';
import { marketplace } from '$lib/pocketbase/managers';

var root = $.from_html(`<!> <!>`, 1);

export default function BlockPicker($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.state($.proxy([]));
	let loading = $.state(false);

	const selected_symbols = $.derived(() => $.get(selected).map(({ id, source }) => {
		const symbol = source === 'library'
			? LibrarySymbols.one(id)
			: LibrarySymbols.from(marketplace).one(id);

		const fields = symbol?.fields();
		const entries = symbol?.entries();

		return symbol && fields && entries ? { symbol, fields, entries } : null;
	}).filter((symbol) => !!symbol));

	async function handleSave() {
		$.set(loading, true);

		try {
			await $$props.onsave($.get(selected_symbols));
		} finally {
			$.set(loading, false);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			label: `Add ${$.get(selected_symbols).length} Blocks`,
			onclick: handleSave,
			disabled: $.get(selected_symbols).length === 0 || $.get(loading),
			loading: $.get(loading)
		}));

		$.component(node, () => Dialog.Header, ($$anchor, Dialog_Header) => {
			Dialog_Header($$anchor, {
				class: 'mb-2',
				title: 'Add Blocks to Site',
				icon: 'lucide:plus-square',
				get button() {
					return $.get($0);
				}
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	BlockPickerPanel(node_1, {
		get selected() {
			return $.get(selected);
		},

		set selected($$value) {
			$.set(selected, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}