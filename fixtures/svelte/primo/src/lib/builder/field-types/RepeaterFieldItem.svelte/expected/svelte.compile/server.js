import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import * as _ from 'lodash-es';
import { onMount } from 'svelte';
import Icon from '@iconify/svelte';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import pluralize from 'pluralize';
import EntryContent from '../components/Fields/EntryContent.svelte';
import { useEntries } from '$lib/Content.svelte';
import { mod_key_held } from '../stores/app/misc';
import { site_context } from '../stores/context';

export default function RepeaterFieldItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		let {
			entity,
			field,
			entry,
			fields,
			subfields,
			entries,
			index,
			level,
			is_visible,
			autofocus,
			hovering,
			hover_position,
			onchange,
			ondelete
		} = $$props;

		function get_image(subfields) {
			const [first_subfield] = subfields;

			if (first_subfield && first_subfield.type === 'image') {
				const [ent] = useEntries(entity, first_subfield, entry) ?? [];

				return ent?.value?.url;
			} else return null;
		}

		function get_icon(subfields) {
			const [first_subfield] = subfields;

			if (first_subfield && first_subfield.type === 'icon') {
				const [ent] = useEntries(entity, first_subfield, entry) ?? [];

				return ent?.value;
			} else return null;
		}

		function get_title(subfields) {
			const first_subfield = subfields.find((subfield) => ['text', 'markdown', 'link', 'number', 'page'].includes(subfield.type));

			if (first_subfield) {
				const [ent] = useEntries(entity, first_subfield, entry) ?? [];

				if (first_subfield.type === 'link') return ent?.value?.label; else if (first_subfield.type === 'page') {
					const page = site_context.get().value?.pages()?.find((p) => p.id === ent?.value);

					return page?.name;
				} else return ent?.value;
			} else {
				return singular_label();
			}
		}

		// let drag_handle_element = $state()
		let element = void 0;

		// onMount(async () => {
		// 	draggable({
		// 		element,
		// 		dragHandle: drag_handle_element,
		// 		getInitialData: () => ({})
		// 	})
		// 	dropTargetForElements({
		// 		element,
		// 		getData({ input, element }) {
		// 			return attachClosestEdge(
		// 				{},
		// 				{
		// 					element,
		// 					input,
		// 					allowedEdges: ['top', 'bottom']
		// 				}
		// 			)
		// 		},
		// 		onDrag({ self, source }) {
		// 			dispatch('hover', extractClosestEdge(self.data))
		// 		},
		// 		onDragLeave() {
		// 			dispatch('hover', null)
		// 		},
		// 		onDrop({ self, source }) {
		// 			const item_dragged_over = self.data.item
		// 			const item_being_dragged = source.data.item
		// 			const closestEdgeOfTarget = extractClosestEdge(self.data)
		// 			// if (item_dragged_over.index === 0) return // can't place above home
		// 			if (closestEdgeOfTarget === 'top') {
		// 				// actions.rearrange(item_being_dragged, item_dragged_over.index)
		// 				dispatch('move', { item: item_being_dragged, new_index: item_dragged_over.index })
		// 			} else if (closestEdgeOfTarget === 'bottom') {
		// 				dispatch('move', { item: item_being_dragged, new_index: item_dragged_over.index + 1 })
		// 				// actions.rearrange(item_being_dragged, item_dragged_over.index + 1)
		// 			}
		// 			dispatch('hover', null)
		// 		}
		// 	})
		// })
		let singular_label = $.derived(() => pluralize.singular(field.label));

		let item_image = $.derived(() => get_image(subfields));
		let item_icon = $.derived(() => get_icon(subfields));
		let item_title = $.derived(() => get_title(subfields));

		$$renderer.push(`<div${$.attr_class('RepeaterFieldItem svelte-1hwtezn', void 0, {
			'hovering-above': hovering && hover_position === 'top',
			'hovering-below': hovering && hover_position === 'bottom'
		})}${$.attr('id', `repeater-${$.stringify(field.key)}-${$.stringify(index)}`)}><div class="repeater-item-container svelte-1hwtezn"><div class="item-options svelte-1hwtezn"><button class="title svelte-1hwtezn"${$.attr('title', $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) ? 'Toggle all items' : '')}>`);

		if (item_image()) {
			$$renderer.push(`<!--[0--><img${$.attr('src', item_image())}${$.attr('alt', item_title() || `Preview for item ${index} in ${field.label}`)} class="svelte-1hwtezn"/>`);
		} else if (item_icon()) {
			$$renderer.push(`<!--[1--><div style="font-size:1.5rem;">${$.html(item_icon())}</div>`);
		} else {
			$$renderer.push(`<!--[-1--><span style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;min-height: 19px;">${$.escape(item_title())}</span>`);
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
			$$renderer.push(`<!--[0--><span class="key-hint svelte-1hwtezn"><span>⌘</span> `);
			Icon($$renderer, { icon: 'fa6-solid:hand-pointer' });
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { icon: is_visible ? 'ph:caret-up-bold' : 'ph:caret-down-bold' });
		}

		$$renderer.push(`<!--]--></button> <div class="primo-buttons svelte-1hwtezn"><button${$.attr('title', `Delete ${$.stringify(singular_label())} item`)} class="svelte-1hwtezn">`);
		Icon($$renderer, { icon: 'ion:trash' });
		$$renderer.push(`<!----></button></div></div> `);

		if (is_visible) {
			$$renderer.push(`<!--[0--><div class="field-values svelte-1hwtezn"><!--[-->`);

			const each_array = $.ensure_array_like(subfields);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let subfield = each_array[$$index];

				$$renderer.push(`<div class="repeater-item-field svelte-1hwtezn"${$.attr('id', `repeater-${$.stringify(field.key)}-${$.stringify(index)}-${$.stringify(subfield.key)}`)}>`);

				EntryContent($$renderer, {
					entity,
					parent: entry,
					field: subfield,
					fields,
					entries,
					level: level + 1,
					minimal: true,
					onchange: (values) => onchange({ [field.key]: { [index]: { value: null, subValues: values } } }),
					ondelete
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}