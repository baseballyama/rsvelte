import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { Toolbar } from "@svar-ui/svelte-toolbar";
import { defaultToolbarButtons, assignChecks, handleAction } from "@svar-ui/grid-store";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/grid-locales";

export default function Toolbar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			api,
			items = [...defaultToolbarButtons],
			onclick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const _ = getContext("wx-i18n")?.getGroup("grid") || locale(en).getGroup("grid");
		let state = $.derived(() => api?.getReactiveState());

		const $$d = $.derived(() => state() ?? {}),
			selectedRows = $.derived(() => $$d().selectedRows),
			data = $.derived(() => $$d().data),
			history = $.derived(() => $$d().history),
			reorder = $.derived(() => $$d().reorder),
			undo = $.derived(() => $$d().undo);

		const rowActions = [
			"open-editor",
			"delete-row",
			"copy-row",
			"cut-row",
			"paste-row",
			"move-item:up",
			"move-item:down"
		];

		const historyActions = ["undo", "redo"];

		const normalizedItems = $.derived(() => {
			const filtered = filterItems(items);
			const normalized = assignChecks(filtered);

			applyLocale(normalized);

			return normalized;
		});

		function applyLocale(options) {
			options.forEach((op) => {
				if (op.text) op.text = _(op.text);
				if (op.menuText) op.menuText = _(op.menuText);
				if (op.items) op.items = applyLocale(op.items);
			});
		}

		function filterItems(items) {
			if ($.store_get($$store_subs ??= {}, '$undo', undo()) && $.store_get($$store_subs ??= {}, '$reorder', reorder())) return items;

			return items.filter(({ id }) => {
				return !(!$.store_get($$store_subs ??= {}, '$undo', undo()) && (id === "undo" || id === "redo") || !$.store_get($$store_subs ??= {}, '$reorder', reorder()) && (id === "move-item:up" || id === "move-item:down"));
			});
		}

		const buttons = $.derived(() => {
			const finalButtons = [];
			const selected = $.store_get($$store_subs ??= {}, '$selectedRows', selectedRows())?.length;

			normalizedItems().forEach((item) => {
				const action = item.id;

				if (action === "add-row") {
					finalButtons.push(item);
				} else if (rowActions.includes(action)) {
					if (!selected) return;

					finalButtons.push({
						...item,
						disabled: item.isDisabled && item.isDisabled(
							action === "paste-row"
								? api
								: $.store_get($$store_subs ??= {}, '$selectedRows', selectedRows()),
							$.store_get($$store_subs ??= {}, '$data', data())
						)
					});
				} else if (historyActions.includes(action)) {
					finalButtons.push({
						...item,
						disabled: item.isDisabled($.store_get($$store_subs ??= {}, '$history', history()))
					});
				} else {
					finalButtons.push(item);
				}
			});

			return finalButtons;
		});

		const handleClicks = (ev) => {
			const option = ev.item;

			if (option) handleAction(api, option.id);

			onclick && onclick(ev);
		};

		Toolbar($$renderer, $.spread_props([{ items: buttons(), onclick: handleClicks }, restProps]));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}