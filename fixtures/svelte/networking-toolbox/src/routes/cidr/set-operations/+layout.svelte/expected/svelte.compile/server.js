import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { setOperationsContent } from '$lib/content/cidr-set-operations';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--> <section class="reference svelte-1pc2fd8"><h3 class="svelte-1pc2fd8">${$.escape(setOperationsContent.title)}</h3> <p class="svelte-1pc2fd8">${$.escape(setOperationsContent.description)}</p> <div class="operations-grid svelte-1pc2fd8"><!--[-->`);

		const each_array = $.ensure_array_like(setOperationsContent.operations);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let operation = each_array[index];

			$$renderer.push(`<div class="operation-card svelte-1pc2fd8"><div class="operation-header svelte-1pc2fd8"><div class="operation-symbol svelte-1pc2fd8">${$.escape(operation.symbol)}</div> <div class="operation-name svelte-1pc2fd8">${$.escape(operation.name)}</div></div> <div class="operation-desc svelte-1pc2fd8">${$.escape(operation.description)}</div> <div class="operation-example svelte-1pc2fd8"><strong class="svelte-1pc2fd8">Example:</strong> <code class="svelte-1pc2fd8">${$.escape(operation.example)}</code></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="patterns-section svelte-1pc2fd8"><h4 class="svelte-1pc2fd8">Common Network Patterns</h4> <div class="patterns-grid svelte-1pc2fd8"><!--[-->`);

		const each_array_1 = $.ensure_array_like(setOperationsContent.patterns);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let pattern = each_array_1[index];

			$$renderer.push(`<div class="pattern-card svelte-1pc2fd8"><h5 class="svelte-1pc2fd8">`);
			Icon($$renderer, { name: pattern.icon, size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(pattern.title)}</h5> <ul class="svelte-1pc2fd8"><!--[-->`);

			const each_array_2 = $.ensure_array_like(pattern.items);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let item = each_array_2[index];

				$$renderer.push(`<li class="svelte-1pc2fd8"><strong class="svelte-1pc2fd8">${$.escape(item.term)}:</strong> ${$.escape(item.description)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="notes-section svelte-1pc2fd8"><h4 class="svelte-1pc2fd8">Implementation Notes</h4> <div class="notes-grid svelte-1pc2fd8"><!--[-->`);

		const each_array_3 = $.ensure_array_like(setOperationsContent.notes);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let note = each_array_3[index];

			$$renderer.push(`<div class="note-item svelte-1pc2fd8"><h5 class="svelte-1pc2fd8">${$.escape(note.title)}</h5> <p class="svelte-1pc2fd8">${$.escape(note.content)}</p></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="best-practices info-panel info svelte-1pc2fd8"><h4 class="svelte-1pc2fd8">Best Practices</h4> <ul class="svelte-1pc2fd8"><!--[-->`);

		const each_array_4 = $.ensure_array_like(setOperationsContent.bestPractices);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let practice = each_array_4[index];

			$$renderer.push(`<li class="svelte-1pc2fd8"><strong class="svelte-1pc2fd8">${$.escape(practice.term)}:</strong> ${$.escape(practice.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></section>`);
	});
}