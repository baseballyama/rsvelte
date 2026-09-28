import * as $ from 'svelte/internal/server';
import { ComboBox, Dropdown, MultiSelect, Select, SelectItem } from "carbon-components-svelte";

export default function ItemsResyncFixture($$renderer) {
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button" data-testid="load">Load options</button> <button type="button" data-testid="reload">Reload options</button> <button type="button" data-testid="clear-fill">Clear fill</button> <button type="button" data-testid="reload-without-orwell">Reload without orwell</button> <button type="button" data-testid="remove-non-selected">Remove non-selected</button> <button type="button" data-testid="toggle-no-selection-option">Toggle no-selection option</button> `);

		ComboBox($$renderer, {
			'data-testid': 'cb-preload',
			labelText: 'ComboBox preload',
			items: cbPreloadItems,
			get selectedId() {
				return cbPreloadSelectedId;
			},

			set selectedId($$value) {
				cbPreloadSelectedId = $$value;
				$$settled = false;
			},

			get value() {
				return cbPreloadValue;
			},

			set value($$value) {
				cbPreloadValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p data-testid="cb-preload-id">${$.escape(cbPreloadSelectedId)}</p> `);

		ComboBox($$renderer, {
			'data-testid': 'cb-fill',
			labelText: 'ComboBox fill',
			items: cbFillItems,
			get selectedId() {
				return cbFillSelectedId;
			},

			set selectedId($$value) {
				cbFillSelectedId = $$value;
				$$settled = false;
			},

			get value() {
				return cbFillValue;
			},

			set value($$value) {
				cbFillValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p data-testid="cb-fill-id">${$.escape(cbFillSelectedId)}</p> `);

		ComboBox($$renderer, {
			'data-testid': 'cb-swap',
			labelText: 'ComboBox swap',
			items: cbSwapItems,
			get selectedId() {
				return cbSwapSelectedId;
			},

			set selectedId($$value) {
				cbSwapSelectedId = $$value;
				$$settled = false;
			},

			get value() {
				return cbSwapValue;
			},

			set value($$value) {
				cbSwapValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p data-testid="cb-swap-id">${$.escape(cbSwapSelectedId)}</p> `);

		ComboBox($$renderer, {
			'data-testid': 'cb-remove',
			labelText: 'ComboBox remove',
			items: cbRemoveItems,
			get selectedId() {
				return cbRemoveSelectedId;
			},

			set selectedId($$value) {
				cbRemoveSelectedId = $$value;
				$$settled = false;
			},

			get value() {
				return cbRemoveValue;
			},

			set value($$value) {
				cbRemoveValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p data-testid="cb-remove-id">${$.escape(cbRemoveSelectedId)}</p> `);

		ComboBox($$renderer, {
			'data-testid': 'cb-keep',
			labelText: 'ComboBox keep',
			items: cbKeepItems,
			get selectedId() {
				return cbKeepSelectedId;
			},

			set selectedId($$value) {
				cbKeepSelectedId = $$value;
				$$settled = false;
			},

			get value() {
				return cbKeepValue;
			},

			set value($$value) {
				cbKeepValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p data-testid="cb-keep-id">${$.escape(cbKeepSelectedId)}</p> `);

		Select($$renderer, {
			'data-testid': 'sel-fill',
			labelText: 'Select fill',
			get selected() {
				return selFillSelected;
			},

			set selected($$value) {
				selFillSelected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(selFillItems);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					SelectItem($$renderer, { value: item.id, text: item.text });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p data-testid="sel-fill-selected">${$.escape(selFillSelected)}</p> `);

		Select($$renderer, {
			'data-testid': 'sel-swap',
			labelText: 'Select swap',
			get selected() {
				return selSwapSelected;
			},

			set selected($$value) {
				selSwapSelected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(selSwapItems);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_1[$$index_1];

					SelectItem($$renderer, { value: item.id, text: item.text });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p data-testid="sel-swap-selected">${$.escape(selSwapSelected)}</p> `);

		Select($$renderer, {
			'data-testid': 'sel-remove',
			labelText: 'Select remove non-selected',
			get selected() {
				return selRemoveSelected;
			},

			set selected($$value) {
				selRemoveSelected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_2 = $.ensure_array_like(selRemoveItems);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let item = each_array_2[$$index_2];

					SelectItem($$renderer, { value: item.id, text: item.text });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p data-testid="sel-remove-selected">${$.escape(selRemoveSelected)}</p> `);

		Select($$renderer, {
			'data-testid': 'sel-no-selection',
			labelText: 'Select no selection',
			children: ($$renderer) => {
				SelectItem($$renderer, { value: '', text: 'Choose an option' });
				$$renderer.push(`<!----> `);
				SelectItem($$renderer, { value: 'austen', text: 'Jane Austen' });
				$$renderer.push(`<!----> `);

				if (selNoSelectionExtra) {
					$$renderer.push('<!--[0-->');
					SelectItem($$renderer, { value: 'dickens', text: 'Charles Dickens' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div data-testid="ms-swap">`);

		MultiSelect($$renderer, {
			labelText: 'MultiSelect swap',
			label: 'Choose authors',
			items: msSwapItems,
			get selectedIds() {
				return msSwapSelectedIds;
			},

			set selectedIds($$value) {
				msSwapSelectedIds = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <p data-testid="ms-swap-ids">${$.escape(msSwapSelectedIds.join(","))}</p> <div data-testid="ms-remove">`);

		MultiSelect($$renderer, {
			labelText: 'MultiSelect remove non-selected',
			label: 'Choose authors',
			items: msRemoveItems,
			get selectedIds() {
				return msRemoveSelectedIds;
			},

			set selectedIds($$value) {
				msRemoveSelectedIds = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <p data-testid="ms-remove-ids">${$.escape(msRemoveSelectedIds.join(","))}</p> <div data-testid="ms-fill">`);

		MultiSelect($$renderer, {
			labelText: 'MultiSelect fill',
			label: 'Choose authors',
			items: msFillItems,
			get selectedIds() {
				return msFillSelectedIds;
			},

			set selectedIds($$value) {
				msFillSelectedIds = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <p data-testid="ms-fill-ids">${$.escape(msFillSelectedIds.join(","))}</p> <div data-testid="drop-fill">`);

		Dropdown($$renderer, {
			titleText: 'Dropdown fill',
			items: dropFillItems,
			get selectedId() {
				return dropFillSelectedId;
			},

			set selectedId($$value) {
				dropFillSelectedId = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <p data-testid="drop-fill-id">${$.escape(dropFillSelectedId)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}