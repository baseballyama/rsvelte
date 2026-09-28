import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox, InlineLoading, Stack } from "carbon-components-svelte";

var root = $.from_html(`<p></p>`);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ScrollEndComboBox($$anchor, $$props) {
	$.push($$props, true);

	const PAGE_SIZE = 40;
	const TOTAL = 200;
	let items = [];
	let loading = false;
	let hasMore = true;

	function makePage(offset) {
		return Array.from({ length: PAGE_SIZE }, (_, i) => {
			const n = offset + i;

			return { id: String(n), text: `Item ${n + 1}` };
		}).filter((item) => Number(item.id) < TOTAL);
	}

	async function loadMore() {
		if (loading || !hasMore) return;

		loading = true;
		await new Promise((resolve) => setTimeout(resolve, 400));

		const next = makePage(items.length);

		items = [...items, ...next];
		hasMore = items.length < TOTAL;
		loading = false;
	}

	loadMore();

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			ComboBox(node, {
				labelText: 'Load more on scroll',
				placeholder: 'Open and scroll to the bottom…',
				get items() {
					return items;
				},
				shouldFilterItem: () => true,
				virtualize: { containerHeight: 240, threshold: 1 },
				$$events: { scrollend: loadMore }
			});

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					InlineLoading($$anchor, { description: 'Loading more…' });
				};

				var consequent_1 = ($$anchor) => {
					var p = root();

					p.textContent = 'Loaded all 200 items.';
					$.append($$anchor, p);
				};

				var alternate = ($$anchor) => {
					var p_1 = root_1();
					var text = $.only_child(p_1);

					$.template_effect(() => $.set_text(text, `${items.length ?? ''}
      of 200 loaded. Scroll the menu to fetch the next page.`));

					$.append($$anchor, p_1);
				};

				$.if(node_1, ($$render) => {
					if (loading) $$render(consequent); else if (!hasMore) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}