import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { Toolbar } from "@svar-ui/svelte-toolbar";
import { defaultToolbarButtons, assignChecks, handleAction } from "@svar-ui/grid-store";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/grid-locales";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'api', 'items', 'onclick']);

export default function Toolbar_1($$anchor, $$props) {
	$.push($$props, true);

	const $undo = () => $.store_get($.get(undo), '$undo', $$stores);
	const $reorder = () => $.store_get($.get(reorder), '$reorder', $$stores);
	const $selectedRows = () => $.store_get($.get(selectedRows), '$selectedRows', $$stores);
	const $data = () => $.store_get($.get(data), '$data', $$stores);
	const $history = () => $.store_get($.get(history), '$history', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let items = $.prop($$props, 'items', 19, () => [...defaultToolbarButtons]),
		restProps = $.rest_props($$props, rest_excludes);

	const _ = getContext("wx-i18n")?.getGroup("grid") || locale(en).getGroup("grid");
	let state = $.derived(() => $$props.api?.getReactiveState());

	const $$d = $.derived(() => $.get(state) ?? {}),
		selectedRows = $.derived(() => $.get($$d).selectedRows),
		data = $.derived(() => $.get($$d).data),
		history = $.derived(() => $.get($$d).history),
		reorder = $.derived(() => $.get($$d).reorder),
		undo = $.derived(() => $.get($$d).undo);

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
		const filtered = filterItems(items());
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
		if ($undo() && $reorder()) return items;

		return items.filter(({ id }) => {
			return !(!$undo() && (id === "undo" || id === "redo") || !$reorder() && (id === "move-item:up" || id === "move-item:down"));
		});
	}

	const buttons = $.derived(() => {
		const finalButtons = [];
		const selected = $selectedRows()?.length;

		$.get(normalizedItems).forEach((item) => {
			const action = item.id;

			if (action === "add-row") {
				finalButtons.push(item);
			} else if (rowActions.includes(action)) {
				if (!selected) return;

				finalButtons.push({
					...item,
					disabled: item.isDisabled && item.isDisabled(action === "paste-row" ? $$props.api : $selectedRows(), $data())
				});
			} else if (historyActions.includes(action)) {
				finalButtons.push({ ...item, disabled: item.isDisabled($history()) });
			} else {
				finalButtons.push(item);
			}
		});

		return finalButtons;
	});

	const handleClicks = (ev) => {
		const option = ev.item;

		if (option) handleAction($$props.api, option.id);

		$$props.onclick && $$props.onclick(ev);
	};

	Toolbar($$anchor, $.spread_props(
		{
			get items() {
				return $.get(buttons);
			},
			onclick: handleClicks
		},
		() => restProps
	));

	$.pop();
	$$cleanup();
}