import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	function setKey(key, value) {
		console.log(`setKey(${key}, ${value})`);
	}

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { key: 'a', set: setKey }, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'default', { key: 'b', set: setKey }, null);
	$$renderer.push(`<!--]-->`);
}