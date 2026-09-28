import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, setContext } from "svelte";
import { writable } from "svelte/store";
import { Locale } from "@svar-ui/svelte-core";
import { en } from "@svar-ui/grid-locales";
import { EventBusRouter } from "@svar-ui/lib-state";
import { DataStore } from "@svar-ui/grid-store";
import Layout from "./Layout.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'data',
	'columns',
	'rowStyle',
	'columnStyle',
	'cellStyle',
	'selectedRows',
	'select',
	'multiselect',
	'header',
	'footer',
	'dynamic',
	'overlay',
	'reorder',
	'draggableRows',
	'onreorder',
	'autoRowHeight',
	'sizes',
	'split',
	'tree',
	'autoConfig',
	'init',
	'responsive',
	'sortMarks',
	'undo',
	'hotkeys',
	'filterValues'
]);

export default function Grid($$anchor, $$props) {
	$.push($$props, true);

	// svelte core
	// core widgets lib
	// stores
	// ui
	let data = $.prop($$props, 'data', 19, () => []),
		columns = $.prop($$props, 'columns', 19, () => []),
		rowStyle = $.prop($$props, 'rowStyle', 3, null),
		columnStyle = $.prop($$props, 'columnStyle', 3, null),
		cellStyle = $.prop($$props, 'cellStyle', 3, null),
		selectedRows = $.prop($$props, 'selectedRows', 19, () => []),
		select = $.prop($$props, 'select', 3, true),
		multiselect = $.prop($$props, 'multiselect', 3, false),
		header = $.prop($$props, 'header', 3, true),
		footer = $.prop($$props, 'footer', 3, false),
		dynamic = $.prop($$props, 'dynamic', 3, null),
		overlay = $.prop($$props, 'overlay', 3, null),
		reorder = $.prop($$props, 'reorder', 3, false),
		draggableRows = $.prop($$props, 'draggableRows', 3, false),
		onreorder = $.prop($$props, 'onreorder', 3, null),
		autoRowHeight = $.prop($$props, 'autoRowHeight', 3, false),
		sizes = $.prop($$props, 'sizes', 19, () => ({})),
		split = $.prop($$props, 'split', 19, () => ({ left: 0 })),
		tree = $.prop($$props, 'tree', 3, false),
		autoConfig = $.prop($$props, 'autoConfig', 3, false),
		init = $.prop($$props, 'init', 3, null),
		responsive = $.prop($$props, 'responsive', 3, null),
		sortMarks = $.prop($$props, 'sortMarks', 19, () => ({})),
		undo = $.prop($$props, 'undo', 3, false),
		hotkeys = $.prop($$props, 'hotkeys', 3, null),
		filterValues = $.prop($$props, 'filterValues', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	let clientWidth = $.state(0);
	let clientHeight = $.state(0);
	let responsiveLevel = $.state(null);
	let responsiveConfig = $.state(null);

	// init stores
	const dataStore = new DataStore(writable);

	// define event route
	let firstInRoute = dataStore.in;

	const dash = /-/g;

	let lastInRoute = new EventBusRouter((a, b) => {
		const name = "on" + a.replace(dash, "");

		if (restProps[name]) {
			restProps[name](b);
		}
	});

	firstInRoute.setNext(lastInRoute);

	const // public API
	// state
	getState = dataStore.getState.bind(dataStore);

	const getReactiveState = dataStore.getReactive.bind(dataStore);
	const getStores = () => ({ data: dataStore });

	const // events
	exec = firstInRoute.exec;

	const setNext = (ev) => lastInRoute = lastInRoute.setNext(ev);
	const intercept = firstInRoute.intercept.bind(firstInRoute);
	const on = firstInRoute.on.bind(firstInRoute);
	const detach = firstInRoute.detach.bind(firstInRoute);

	const // extra api
	getRow = (id) => dataStore.getRow(id);

	const getColumn = (id) => dataStore.getColumn(id);

	const api = {
		exec,
		setNext,
		intercept,
		on,
		detach,
		getRow,
		getColumn,
		getState,
		getReactiveState,
		getStores
	};

	// common API available in components
	setContext("grid-store", {
		getState: dataStore.getState.bind(dataStore),
		getReactiveState: dataStore.getReactive.bind(dataStore),
		exec: firstInRoute.exec.bind(firstInRoute),
		getRow: dataStore.getRow.bind(dataStore)
	});

	// auto config columns
	const finalColumns = $.derived(() => {
		if (autoConfig() && !columns().length && data().length) {
			const test = data()[0];
			const autoCols = [];

			for (let key in test) {
				if (key !== "id" && key[0] !== "$") {
					let col = { id: key, header: key[0].toUpperCase() + key.slice(1) };

					if (typeof autoConfig() === "object") {
						col = { ...col, ...autoConfig() };
					}

					autoCols.push(col);
				}
			}

			return autoCols;
		}

		return $.get(responsiveConfig)?.columns ?? columns();
	});

	const finalSizes = $.derived(() => $.get(responsiveConfig)?.sizes ?? sizes());

	function resize(rect) {
		$.set(clientWidth, rect.width, true);
		$.set(clientHeight, rect.height, true);

		if (responsive()) {
			const levels = Object.keys(responsive()).map(Number).sort((a, b) => a - b);
			const newLevel = levels.find((level) => $.get(clientWidth) <= level) ?? null;

			if (newLevel !== $.get(responsiveLevel)) {
				$.set(responsiveConfig, responsive()[newLevel], true);
				$.set(responsiveLevel, newLevel, true);
			}
		}
	}

	let _skin = $.derived(() => getContext("wx-theme"));
	let init_once = true;

	const reinitStore = () => {
		dataStore.init({
			data: data(),
			columns: $.get(finalColumns),
			split: split(),
			sizes: $.get(finalSizes),
			selectedRows: selectedRows(),
			dynamic: dynamic(),
			tree: tree(),
			sortMarks: sortMarks(),
			filterValues: filterValues(),
			select: select(),
			undo: undo(),
			reorder: reorder(),
			_skin: $.get(_skin)
		});

		if (init_once && init()) {
			init()(api);
			init_once = false;
		}
	};

	reinitStore();
	$.user_effect(reinitStore);

	var $$exports = {
		getState,
		getReactiveState,
		getStores,
		exec,
		setNext,
		intercept,
		on,
		detach,
		getRow,
		getColumn
	};

	Locale($$anchor, {
		get words() {
			return en;
		},
		optional: true,
		children: ($$anchor, $$slotProps) => {
			Layout($$anchor, {
				get header() {
					return header();
				},

				get footer() {
					return footer();
				},

				get overlay() {
					return overlay();
				},

				get rowStyle() {
					return rowStyle();
				},

				get columnStyle() {
					return columnStyle();
				},

				get cellStyle() {
					return cellStyle();
				},

				get onreorder() {
					return onreorder();
				},

				get draggableRows() {
					return draggableRows();
				},

				get multiselect() {
					return multiselect();
				},

				get autoRowHeight() {
					return autoRowHeight();
				},

				get clientWidth() {
					return $.get(clientWidth);
				},

				get clientHeight() {
					return $.get(clientHeight);
				},

				get responsiveLevel() {
					return $.get(responsiveLevel);
				},
				resize,
				get hotkeys() {
					return hotkeys();
				}
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}