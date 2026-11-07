import * as $ from 'svelte/internal/server';
import { getContext, setContext } from "svelte";
import { writable } from "svelte/store";
import { Locale } from "@svar-ui/svelte-core";
import { en } from "@svar-ui/grid-locales";
import { EventBusRouter } from "@svar-ui/lib-state";
import { DataStore } from "@svar-ui/grid-store";
import Layout from "./Layout.svelte";

export default function Grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// svelte core
		// core widgets lib
		// stores
		// ui
		let {
			data = [],
			columns = [],
			rowStyle = null,
			columnStyle = null,
			cellStyle = null,
			selectedRows = [],
			select = true,
			multiselect = false,
			header = true,
			footer = false,
			dynamic = null,
			overlay = null,
			reorder = false,
			draggableRows = false,
			onreorder = null,
			autoRowHeight = false,
			sizes = {},
			split = { left: 0 },
			tree = false,
			autoConfig = false,
			init = null,
			responsive = null,
			sortMarks = {},
			undo = false,
			hotkeys = null,
			filterValues = {},
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let clientWidth = 0;
		let clientHeight = 0;
		let responsiveLevel = null;
		let responsiveConfig = null;

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
			if (autoConfig && !columns.length && data.length) {
				const test = data[0];
				const autoCols = [];

				for (let key in test) {
					if (key !== "id" && key[0] !== "$") {
						let col = { id: key, header: key[0].toUpperCase() + key.slice(1) };

						if (typeof autoConfig === "object") {
							col = { ...col, ...autoConfig };
						}

						autoCols.push(col);
					}
				}

				return autoCols;
			}

			return responsiveConfig?.columns ?? columns;
		});

		const finalSizes = $.derived(() => responsiveConfig?.sizes ?? sizes);

		function resize(rect) {
			clientWidth = rect.width;
			clientHeight = rect.height;

			if (responsive) {
				const levels = Object.keys(responsive).map(Number).sort((a, b) => a - b);
				const newLevel = levels.find((level) => clientWidth <= level) ?? null;

				if (newLevel !== responsiveLevel) {
					responsiveConfig = responsive[newLevel];
					responsiveLevel = newLevel;
				}
			}
		}

		let _skin = $.derived(() => getContext("wx-theme"));
		let init_once = true;

		const reinitStore = () => {
			dataStore.init({
				data,
				columns: finalColumns(),
				split,
				sizes: finalSizes(),
				selectedRows,
				dynamic,
				tree,
				sortMarks,
				filterValues,
				select,
				undo,
				reorder,
				_skin: _skin()
			});

			if (init_once && init) {
				init(api);
				init_once = false;
			}
		};

		reinitStore();

		Locale($$renderer, {
			words: en,
			optional: true,
			children: ($$renderer) => {
				Layout($$renderer, {
					header,
					footer,
					overlay,
					rowStyle,
					columnStyle,
					cellStyle,
					onreorder,
					draggableRows,
					multiselect,
					autoRowHeight,
					clientWidth,
					clientHeight,
					responsiveLevel,
					resize,
					hotkeys
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, {
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
		});
	});
}