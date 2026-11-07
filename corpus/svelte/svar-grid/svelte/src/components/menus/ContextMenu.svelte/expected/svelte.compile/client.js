import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu } from "@svar-ui/svelte-menu";
import { getContext } from "svelte";
import { defaultMenuOptions, assignChecks, handleAction } from "@svar-ui/grid-store";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/grid-locales";

export default function ContextMenu_1($$anchor, $$props) {
	$.push($$props, true);

	const $selectedRows = () => $.store_get($.get(selectedRows), '$selectedRows', $$stores);
	const $data = () => $.store_get($.get(data), '$data', $$stores);
	const $reorder = () => $.store_get($.get(reorder), '$reorder', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let options = $.prop($$props, 'options', 19, () => [...defaultMenuOptions]),
		at = $.prop($$props, 'at', 3, "point"),
		resolver = $.prop($$props, 'resolver', 3, getItem);

	const _ = getContext("wx-i18n")?.getGroup("grid") || locale(en).getGroup("grid");
	let state = $.derived(() => $$props.api?.getReactiveState());

	const $$d = $.derived(() => $.get(state) ?? {}),
		selectedRows = $.derived(() => $.get($$d).selectedRows),
		data = $.derived(() => $.get($$d).data),
		reorder = $.derived(() => $.get($$d).reorder);

	const normalizedOptions = $.derived(() => {
		const filtered = filterItems(options());
		const normalized = assignChecks(filtered);

		applyLocale(normalized);

		return normalized;
	});

	function applyLocale(options) {
		options.forEach((op) => {
			if (op.text) op.text = _(op.text);
			if (op.subtext) op.subtext = _(op.subtext);
			if (op.data) op.data = applyLocale(op.data);
		});
	}

	const finalOptions = $.derived(() => {
		const opts = [];

		$.get(normalizedOptions).forEach((item) => {
			switch (item.id) {
				case "move-item:up":

				case "move-item:down":

				case "paste-row":
					{
						if (!item.isDisabled) {
							opts.push(item);

							return;
						}

						const disabled = item.isDisabled(item.id === "paste-row" ? $$props.api : $selectedRows(), $data());

						opts.push({ ...item, disabled });

						break;
					}

				default:
					{
						opts.push(item);

						break;
					}
			}
		});

		return opts;
	});

	function getItem(id) {
		if (!$selectedRows().includes(id)) {
			$$props.api.exec("select-row", { id });
		}

		return id;
	}

	const handleClicks = (ev) => {
		const option = ev.action;

		if (option) handleAction($$props.api, option.id);

		$$props.onclick && $$props.onclick(ev);
	};

	function filterItems(items) {
		if ($reorder()) return items;

		return items.filter(({ id }) => {
			return !(id === "move-item:up" || id === "move-item:down");
		});
	}

	{
		let $0 = $.derived(() => `wx-table-menu ${$$props.css}`);

		ContextMenu($$anchor, {
			get css() {
				return $.get($0);
			},

			get at() {
				return at();
			},

			get dataKey() {
				return $$props.dataKey;
			},

			get options() {
				return $.get(finalOptions);
			},

			get resolver() {
				return resolver();
			},

			get filter() {
				return $$props.filter;
			},
			onclick: handleClicks,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}