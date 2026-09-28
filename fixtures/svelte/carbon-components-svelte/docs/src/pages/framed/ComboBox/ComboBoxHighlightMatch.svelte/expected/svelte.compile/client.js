import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox, fuzzyMatch, highlightSegments } from "carbon-components-svelte";

var root = $.from_html(`<strong> </strong>`);

export default function ComboBoxHighlightMatch($$anchor, $$props) {
	$.push($$props, true);

	let value = "";

	const items = [
		{ id: "0", text: "Apple" },
		{ id: "1", text: "Apricot" },
		{ id: "2", text: "Banana" },
		{ id: "3", text: "Blueberry" },
		{ id: "4", text: "Blackberry" },
		{ id: "5", text: "Cherry" },
		{ id: "6", text: "Cranberry" },
		{ id: "7", text: "Grape" },
		{ id: "8", text: "Mango" },
		{ id: "9", text: "Pineapple" }
	];

	// One matcher drives filtering and highlighting. `shouldFilterItem` keeps
	// the items whose text fuzzy-matches the typed value; the default slot
	// reuses the same match and bolds the characters that matched. Bind `value`
	// to read the typed query inside the slot.
	const shouldFilterItem = (item, value) => fuzzyMatch(item.text, value).matched;

	ComboBox($$anchor, {
		labelText: 'Item',
		placeholder: 'Search for an item',
		shouldFilterItem,
		get items() {
			return items;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.each(node, 17, () => highlightSegments($.get(item).text, fuzzyMatch($.get(item).text, value).indices), $.index, ($$anchor, segment) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var strong = root();
							var text = $.only_child(strong, true);

							$.template_effect(() => $.set_text(text, $.get(segment).text));
							$.append($$anchor, strong);
						};

						var alternate = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(segment).text));
							$.append($$anchor, text_1);
						};

						$.if(node_1, ($$render) => {
							if ($.get(segment).match) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	$.pop();
}