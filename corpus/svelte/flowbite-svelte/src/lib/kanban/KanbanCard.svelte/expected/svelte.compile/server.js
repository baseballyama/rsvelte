import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { kanbanCard } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function KanbanCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			card,
			isDragging = false,
			onDragStart,
			onDragEnd,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("kanbanCard"));
		const styles = kanbanCard();

		$$renderer.push(`<article${$.attributes({
			role: 'listitem',
			draggable: 'true',
			...restProps,
			tabindex: '0',
			'aria-grabbed': isDragging,
			'aria-label': card.title,
			class: $.clsx(styles.card({ isDragging, class: clsx(theme()?.card, classes?.card) }))
		})}><p${$.attr_class($.clsx(styles.cardTitle({ class: clsx(theme()?.cardTitle, classes?.cardTitle) })))}>${$.escape(card.title)}</p> `);

		if (card.description) {
			$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(styles.cardDescription({
				class: clsx(theme()?.cardDescription, classes?.cardDescription)
			})))}>${$.escape(card.description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (card.tags?.length) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(styles.cardTags({ class: clsx(theme()?.cardTags, classes?.cardTags) })))}><!--[-->`);

			const each_array = $.ensure_array_like(card.tags);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let tag = each_array[i];

				$$renderer.push(`<span${$.attr_class($.clsx(styles.cardTag({ class: clsx(theme()?.cardTag, classes?.cardTag) })))}>${$.escape(tag)}</span>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></article>`);
	});
}