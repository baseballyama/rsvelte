import * as $ from 'svelte/internal/server';

export default function Li($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, $$slots, $$events, ...rest } = $$props;
		const isTask = $.derived(() => rest.class?.includes('task-list-item'));

		$$renderer.push(`<li${$.attributes({
			class: `${isTask() ? 'list-none *:first:mr-1' : ''} ${$.stringify(rest.class)}`,
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
	});
}