import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	$$renderer.push(`<div${$.attr_class(active ? 'active' : '')}>...</div> <div${$.attr_class('', void 0, { 'active': active })}>...</div> <div${$.attr_class('', void 0, { 'active': active })}>...</div> <div${$.attr_class('', void 0, { 'active': active, 'inactive': !active, 'isAdmin': isAdmin })}>...</div>`);
}