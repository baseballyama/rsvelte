import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import BlockPickerPanel from '$lib/components/BlockPickerPanel.svelte';
import { LibrarySymbolEntries, LibrarySymbolFields, LibrarySymbols } from '$lib/pocketbase/collections';
import { marketplace } from '$lib/pocketbase/managers';

export default function BlockPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onsave } = $$props;
		let selected = [];
		let loading = false;

		const selected_symbols = $.derived(() => selected.map(({ id, source }) => {
			const symbol = source === 'library'
				? LibrarySymbols.one(id)
				: LibrarySymbols.from(marketplace).one(id);

			const fields = symbol?.fields();
			const entries = symbol?.entries();

			return symbol && fields && entries ? { symbol, fields, entries } : null;
		}).filter((symbol) => !!symbol));

		async function handleSave() {
			loading = true;

			try {
				await onsave(selected_symbols());
			} finally {
				loading = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Header) {
				$$renderer.push('<!--[-->');

				Dialog.Header($$renderer, {
					class: 'mb-2',
					title: 'Add Blocks to Site',
					icon: 'lucide:plus-square',
					button: {
						label: `Add ${selected_symbols().length} Blocks`,
						onclick: handleSave,
						disabled: selected_symbols().length === 0 || loading,
						loading
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			BlockPickerPanel($$renderer, {
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}