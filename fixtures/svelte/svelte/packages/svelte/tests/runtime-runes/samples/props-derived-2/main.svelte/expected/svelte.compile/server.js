import * as $ from 'svelte/internal/server';
import Item from './Item.svelte';

export default function Main($$renderer) {
	let activeIndex = 0;

	$$renderer.push(`<input${$.attr('value', activeIndex)} type="number" min="0"${$.attr('max', 4)}/> `);
	Item($$renderer, { active: activeIndex == 0 });
	$$renderer.push(`<!----> `);
	Item($$renderer, { active: activeIndex == 1 });
	$$renderer.push(`<!----> `);
	Item($$renderer, { active: activeIndex == 2 });
	$$renderer.push(`<!----> `);
	Item($$renderer, { active: activeIndex == 3 });
	$$renderer.push(`<!----> `);
	Item($$renderer, { active: activeIndex == 4 });
	$$renderer.push(`<!---->`);
}