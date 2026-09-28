import * as $ from 'svelte/internal/server';

export default function Ul($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, $$slots, $$events, ...rest } = $$props;
		const isTaskList = $.derived(() => rest.class?.includes('contains-task-list'));

		$$renderer.push(`<ul${$.attr_class(`${isTaskList() ? '' : 'list-disc list-outside pl-4'} space-y-1`)}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
	});
}