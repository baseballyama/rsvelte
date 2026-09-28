import * as $ from 'svelte/internal/server';
import { ContextMenu } from "@svar-ui/svelte-menu";
import { getContext } from "svelte";
import { defaultMenuOptions, assignChecks, handleAction } from "@svar-ui/grid-store";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/grid-locales";

export default function ContextMenu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			api,
			options = [...defaultMenuOptions],
			at = "point",
			resolver = getItem,
			dataKey,
			filter,
			css,
			children,
			onclick
		} = $$props;

		const _ = getContext("wx-i18n")?.getGroup("grid") || locale(en).getGroup("grid");
		let state = $.derived(() => api?.getReactiveState());

		const $$d = $.derived(() => state() ?? {}),
			selectedRows = $.derived(() => $$d().selectedRows),
			data = $.derived(() => $$d().data),
			reorder = $.derived(() => $$d().reorder);

		const normalizedOptions = $.derived(() => {
			const filtered = filterItems(options);
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

			normalizedOptions().forEach((item) => {
				switch (item.id) {
					case "move-item:up":

					case "move-item:down":

					case "paste-row":
						{
							if (!item.isDisabled) {
								opts.push(item);

								return;
							}

							const disabled = item.isDisabled(
								item.id === "paste-row"
									? api
									: $.store_get($$store_subs ??= {}, '$selectedRows', selectedRows()),
								$.store_get($$store_subs ??= {}, '$data', data())
							);

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
			if (!$.store_get($$store_subs ??= {}, '$selectedRows', selectedRows()).includes(id)) {
				api.exec("select-row", { id });
			}

			return id;
		}

		const handleClicks = (ev) => {
			const option = ev.action;

			if (option) handleAction(api, option.id);

			onclick && onclick(ev);
		};

		function filterItems(items) {
			if ($.store_get($$store_subs ??= {}, '$reorder', reorder())) return items;

			return items.filter(({ id }) => {
				return !(id === "move-item:up" || id === "move-item:down");
			});
		}

		ContextMenu($$renderer, {
			css: `wx-table-menu ${css}`,
			at,
			dataKey,
			options: finalOptions(),
			resolver,
			filter,
			onclick: handleClicks,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}