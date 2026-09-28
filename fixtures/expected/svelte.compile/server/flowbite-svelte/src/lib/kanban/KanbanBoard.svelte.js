import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { kanbanBoard } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import KanbanCard from "./KanbanCard.svelte";

export default function KanbanBoard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			columns = [],
			onMove = (_card, _from, _to) => {},
			onAddCard = (_col) => {},
			cardProps,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("kanbanBoard"));

		// Changed from KanbanCard to KanbanCardType
		let draggedCard = null;

		let sourceColumnId = null;
		let dragOverColumnId = null;
		const styles = kanbanBoard();

		// Changed parameter type from KanbanCard to KanbanCardType
		function handleDragStart(card, colId) {
			draggedCard = card;
			sourceColumnId = colId;
		}

		function handleDragOver(e, colId) {
			e.preventDefault();
			dragOverColumnId = colId;
		}

		function handleDragLeave(e) {
			const currentTarget = e.currentTarget;
			const relatedTarget = e.relatedTarget;

			if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
				dragOverColumnId = null;
			}
		}

		function handleDrop(e, targetColId) {
			e.preventDefault();
			dragOverColumnId = null;

			if (draggedCard === null || sourceColumnId === null) return;

			if (sourceColumnId === targetColId) {
				draggedCard = null;
				sourceColumnId = null;

				return;
			}

			const fromCol = columns.find((c) => c.id === sourceColumnId);
			const toCol = columns.find((c) => c.id === targetColId);

			if (!fromCol || !toCol) return;

			fromCol.cards = fromCol.cards.filter((c) => c.id !== draggedCard.id);
			toCol.cards = [...toCol.cards, draggedCard];
			onMove(draggedCard, fromCol, toCol);
			draggedCard = null;
			sourceColumnId = null;
		}

		function handleDragEnd() {
			draggedCard = null;
			sourceColumnId = null;
			dragOverColumnId = null;
		}

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(styles.container({ class: clsx(theme()?.container, className) }))
		})}><!--[-->`);

		const each_array = $.ensure_array_like(columns);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let col = each_array[$$index_1];

			$$renderer.push(`<div role="group"${$.attr('aria-label', `${col.title} column drop zone`)}${$.attr_class($.clsx(styles.column({
				isDragOver: dragOverColumnId === col.id,
				class: clsx(theme()?.column, classes?.column)
			})))}${$.attr_style(col.color ? `border-top: 4px solid ${col.color}` : "")}><h2${$.attr_class($.clsx(styles.columnTitle({ class: clsx(theme()?.columnTitle, classes?.columnTitle) })))}>${$.escape(col.title)}</h2> <div${$.attr_class($.clsx(styles.cardList({ class: clsx(theme()?.cardList, classes?.cardList) })))} role="list"${$.attr('aria-label', `${col.title} cards`)}><!--[-->`);

			const each_array_1 = $.ensure_array_like(col.cards);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let card = each_array_1[$$index];

				KanbanCard($$renderer, $.spread_props([
					{ card, classes },
					cardProps,
					{
						isDragging: draggedCard?.id === card.id,
						onDragStart: () => handleDragStart(card, col.id),
						onDragEnd: handleDragEnd
					}
				]));
			}

			$$renderer.push(`<!--]--></div> <button${$.attr_class($.clsx(styles.addButton({ class: clsx(theme()?.addButton, classes?.addButton) })))}${$.attr('aria-label', `Add card to ${col.title}`)}>+ Add card</button></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { columns });
	});
}