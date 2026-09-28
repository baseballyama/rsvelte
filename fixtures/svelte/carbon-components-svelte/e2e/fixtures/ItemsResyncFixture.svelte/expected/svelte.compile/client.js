import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox, Dropdown, MultiSelect, Select, SelectItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<button type="button" data-testid="load">Load options</button> <button type="button" data-testid="reload">Reload options</button> <button type="button" data-testid="clear-fill">Clear fill</button> <button type="button" data-testid="reload-without-orwell">Reload without orwell</button> <button type="button" data-testid="remove-non-selected">Remove non-selected</button> <button type="button" data-testid="toggle-no-selection-option">Toggle no-selection option</button> <!> <p data-testid="cb-preload-id"> </p> <!> <p data-testid="cb-fill-id"> </p> <!> <p data-testid="cb-swap-id"> </p> <!> <p data-testid="cb-remove-id"> </p> <!> <p data-testid="cb-keep-id"> </p> <!> <p data-testid="sel-fill-selected"> </p> <!> <p data-testid="sel-swap-selected"> </p> <!> <p data-testid="sel-remove-selected"> </p> <!> <div data-testid="ms-swap"><!></div> <p data-testid="ms-swap-ids"> </p> <div data-testid="ms-remove"><!></div> <p data-testid="ms-remove-ids"> </p> <div data-testid="ms-fill"><!></div> <p data-testid="ms-fill-ids"> </p> <div data-testid="drop-fill"><!></div> <p data-testid="drop-fill-id"> </p>`, 1);

export default function ItemsResyncFixture($$anchor) {
	// orwell is not the first option; native <select> would otherwise mask a reset.
	// make() returns a new array reference, like an async refetch.
	const make = () => [
		{ id: "austen", text: "Jane Austen" },
		{ id: "dickens", text: "Charles Dickens" },
		{ id: "orwell", text: "George Orwell" },
		{ id: "woolf", text: "Virginia Woolf" }
	];

	const makeWithoutOrwell = () => [
		{ id: "austen", text: "Jane Austen" },
		{ id: "dickens", text: "Charles Dickens" },
		{ id: "woolf", text: "Virginia Woolf" }
	];

	// Drops a non-selected option (austen) while keeping the selected one (orwell).
	const makeWithoutAusten = () => [
		{ id: "dickens", text: "Charles Dickens" },
		{ id: "orwell", text: "George Orwell" },
		{ id: "woolf", text: "Virginia Woolf" }
	];

	const cbPreloadItems = make();
	let cbPreloadSelectedId = "orwell";
	let cbPreloadValue = "";
	let cbFillItems = [];
	let cbFillSelectedId = "orwell";
	let cbFillValue = "";
	let cbSwapItems = make();
	let cbSwapSelectedId = "orwell";
	let cbSwapValue = "George Orwell";
	let cbRemoveItems = make();
	let cbRemoveSelectedId = "orwell";
	let cbRemoveValue = "";
	let cbKeepItems = make();
	let cbKeepSelectedId = "orwell";
	let cbKeepValue = "George Orwell";
	let selFillItems = [];
	let selFillSelected = "orwell";
	let selSwapItems = make();
	let selSwapSelected = "orwell";
	let selRemoveItems = make();
	let selRemoveSelected = "orwell";
	let selNoSelectionExtra = false;
	let msSwapItems = make();
	let msSwapSelectedIds = ["orwell"];
	let msRemoveItems = make();
	let msRemoveSelectedIds = ["orwell"];
	let msFillItems = [];
	let msFillSelectedIds = ["orwell"];
	let dropFillItems = [];
	let dropFillSelectedId = "orwell";

	function load() {
		cbFillItems = make();
		selFillItems = make();
		msFillItems = make();
		dropFillItems = make();
	}

	function reload() {
		cbSwapItems = make();
		selSwapItems = make();
		msSwapItems = make();
	}

	function reloadWithoutOrwell() {
		cbRemoveItems = makeWithoutOrwell();
	}

	// Remove a non-selected option from each component while the selection stays present.
	function removeNonSelected() {
		selRemoveItems = makeWithoutAusten();
		cbKeepItems = makeWithoutAusten();
		msRemoveItems = makeWithoutAusten();
	}

	function clearFill() {
		cbFillItems = [];
		selFillItems = [];
		msFillItems = [];
	}

	function toggleNoSelectionOption() {
		selNoSelectionExtra = !selNoSelectionExtra;
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);
	var node = $.sibling(button_5, 2);

	ComboBox(node, {
		'data-testid': 'cb-preload',
		labelText: 'ComboBox preload',
		get items() {
			return cbPreloadItems;
		},

		get selectedId() {
			return cbPreloadSelectedId;
		},

		set selectedId($$value) {
			cbPreloadSelectedId = $$value;
		},

		get value() {
			return cbPreloadValue;
		},

		set value($$value) {
			cbPreloadValue = $$value;
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);
	var node_1 = $.sibling(p, 2);

	ComboBox(node_1, {
		'data-testid': 'cb-fill',
		labelText: 'ComboBox fill',
		get items() {
			return cbFillItems;
		},

		get selectedId() {
			return cbFillSelectedId;
		},

		set selectedId($$value) {
			cbFillSelectedId = $$value;
		},

		get value() {
			return cbFillValue;
		},

		set value($$value) {
			cbFillValue = $$value;
		}
	});

	var p_1 = $.sibling(node_1, 2);
	var text_1 = $.only_child(p_1, true);
	var node_2 = $.sibling(p_1, 2);

	ComboBox(node_2, {
		'data-testid': 'cb-swap',
		labelText: 'ComboBox swap',
		get items() {
			return cbSwapItems;
		},

		get selectedId() {
			return cbSwapSelectedId;
		},

		set selectedId($$value) {
			cbSwapSelectedId = $$value;
		},

		get value() {
			return cbSwapValue;
		},

		set value($$value) {
			cbSwapValue = $$value;
		}
	});

	var p_2 = $.sibling(node_2, 2);
	var text_2 = $.only_child(p_2, true);
	var node_3 = $.sibling(p_2, 2);

	ComboBox(node_3, {
		'data-testid': 'cb-remove',
		labelText: 'ComboBox remove',
		get items() {
			return cbRemoveItems;
		},

		get selectedId() {
			return cbRemoveSelectedId;
		},

		set selectedId($$value) {
			cbRemoveSelectedId = $$value;
		},

		get value() {
			return cbRemoveValue;
		},

		set value($$value) {
			cbRemoveValue = $$value;
		}
	});

	var p_3 = $.sibling(node_3, 2);
	var text_3 = $.only_child(p_3, true);
	var node_4 = $.sibling(p_3, 2);

	ComboBox(node_4, {
		'data-testid': 'cb-keep',
		labelText: 'ComboBox keep',
		get items() {
			return cbKeepItems;
		},

		get selectedId() {
			return cbKeepSelectedId;
		},

		set selectedId($$value) {
			cbKeepSelectedId = $$value;
		},

		get value() {
			return cbKeepValue;
		},

		set value($$value) {
			cbKeepValue = $$value;
		}
	});

	var p_4 = $.sibling(node_4, 2);
	var text_4 = $.only_child(p_4, true);
	var node_5 = $.sibling(p_4, 2);

	Select(node_5, {
		'data-testid': 'sel-fill',
		labelText: 'Select fill',
		get selected() {
			return selFillSelected;
		},

		set selected($$value) {
			selFillSelected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_6 = $.first_child(fragment_1);

			$.each(node_6, 17, () => selFillItems, (item) => item.id, ($$anchor, item) => {
				SelectItem($$anchor, {
					get value() {
						return $.get(item).id;
					},

					get text() {
						return $.get(item).text;
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var p_5 = $.sibling(node_5, 2);
	var text_5 = $.only_child(p_5, true);
	var node_7 = $.sibling(p_5, 2);

	Select(node_7, {
		'data-testid': 'sel-swap',
		labelText: 'Select swap',
		get selected() {
			return selSwapSelected;
		},

		set selected($$value) {
			selSwapSelected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_8 = $.first_child(fragment_3);

			$.each(node_8, 17, () => selSwapItems, (item) => item.id, ($$anchor, item) => {
				SelectItem($$anchor, {
					get value() {
						return $.get(item).id;
					},

					get text() {
						return $.get(item).text;
					}
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var p_6 = $.sibling(node_7, 2);
	var text_6 = $.only_child(p_6, true);
	var node_9 = $.sibling(p_6, 2);

	Select(node_9, {
		'data-testid': 'sel-remove',
		labelText: 'Select remove non-selected',
		get selected() {
			return selRemoveSelected;
		},

		set selected($$value) {
			selRemoveSelected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_5 = $.comment();
			var node_10 = $.first_child(fragment_5);

			$.each(node_10, 17, () => selRemoveItems, (item) => item.id, ($$anchor, item) => {
				SelectItem($$anchor, {
					get value() {
						return $.get(item).id;
					},

					get text() {
						return $.get(item).text;
					}
				});
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var p_7 = $.sibling(node_9, 2);
	var text_7 = $.only_child(p_7, true);
	var node_11 = $.sibling(p_7, 2);

	Select(node_11, {
		'data-testid': 'sel-no-selection',
		labelText: 'Select no selection',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_12 = $.first_child(fragment_7);

			SelectItem(node_12, { value: '', text: 'Choose an option' });

			var node_13 = $.sibling(node_12, 2);

			SelectItem(node_13, { value: 'austen', text: 'Jane Austen' });

			var node_14 = $.sibling(node_13, 2);

			{
				var consequent = ($$anchor) => {
					SelectItem($$anchor, { value: 'dickens', text: 'Charles Dickens' });
				};

				$.if(node_14, ($$render) => {
					if (selNoSelectionExtra) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node_11, 2);
	var node_15 = $.child(div);

	MultiSelect(node_15, {
		labelText: 'MultiSelect swap',
		label: 'Choose authors',
		get items() {
			return msSwapItems;
		},

		get selectedIds() {
			return msSwapSelectedIds;
		},

		set selectedIds($$value) {
			msSwapSelectedIds = $$value;
		}
	});

	$.reset(div);

	var p_8 = $.sibling(div, 2);
	var text_8 = $.only_child(p_8, true);
	var div_1 = $.sibling(p_8, 2);
	var node_16 = $.child(div_1);

	MultiSelect(node_16, {
		labelText: 'MultiSelect remove non-selected',
		label: 'Choose authors',
		get items() {
			return msRemoveItems;
		},

		get selectedIds() {
			return msRemoveSelectedIds;
		},

		set selectedIds($$value) {
			msRemoveSelectedIds = $$value;
		}
	});

	$.reset(div_1);

	var p_9 = $.sibling(div_1, 2);
	var text_9 = $.only_child(p_9, true);
	var div_2 = $.sibling(p_9, 2);
	var node_17 = $.child(div_2);

	MultiSelect(node_17, {
		labelText: 'MultiSelect fill',
		label: 'Choose authors',
		get items() {
			return msFillItems;
		},

		get selectedIds() {
			return msFillSelectedIds;
		},

		set selectedIds($$value) {
			msFillSelectedIds = $$value;
		}
	});

	$.reset(div_2);

	var p_10 = $.sibling(div_2, 2);
	var text_10 = $.only_child(p_10, true);
	var div_3 = $.sibling(p_10, 2);
	var node_18 = $.child(div_3);

	Dropdown(node_18, {
		titleText: 'Dropdown fill',
		get items() {
			return dropFillItems;
		},

		get selectedId() {
			return dropFillSelectedId;
		},

		set selectedId($$value) {
			dropFillSelectedId = $$value;
		}
	});

	$.reset(div_3);

	var p_11 = $.sibling(div_3, 2);
	var text_11 = $.only_child(p_11, true);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, cbPreloadSelectedId);
			$.set_text(text_1, cbFillSelectedId);
			$.set_text(text_2, cbSwapSelectedId);
			$.set_text(text_3, cbRemoveSelectedId);
			$.set_text(text_4, cbKeepSelectedId);
			$.set_text(text_5, selFillSelected);
			$.set_text(text_6, selSwapSelected);
			$.set_text(text_7, selRemoveSelected);
			$.set_text(text_8, $0);
			$.set_text(text_9, $1);
			$.set_text(text_10, $2);
			$.set_text(text_11, dropFillSelectedId);
		},
		[
			() => msSwapSelectedIds.join(","),
			() => msRemoveSelectedIds.join(","),
			() => msFillSelectedIds.join(",")
		]
	);

	$.event('click', button, load);
	$.event('click', button_1, reload);
	$.event('click', button_2, clearFill);
	$.event('click', button_3, reloadWithoutOrwell);
	$.event('click', button_4, removeNonSelected);
	$.event('click', button_5, toggleNoSelectionOption);
	$.append($$anchor, fragment);
}