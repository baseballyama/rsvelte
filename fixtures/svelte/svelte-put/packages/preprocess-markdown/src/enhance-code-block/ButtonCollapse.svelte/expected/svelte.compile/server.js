import * as $ from 'svelte/internal/server';

export default function ButtonCollapse($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id, collapsed = void 0, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<label${$.attributes({ ...rest }, 'svelte-5u15ai')}><input class="codeblock-collapsed sr-only" type="checkbox"${$.attr('checked', collapsed, true)}${$.attr('id', id)}/> <span class="sr-only">Collapse</span> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentcolor" viewBox="0 0 256 256"${$.attr_class('', void 0, { 'animate-bounce': collapsed })}><path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"></path></svg></label>`);
		$.bind_props($$props, { collapsed });
	});
}