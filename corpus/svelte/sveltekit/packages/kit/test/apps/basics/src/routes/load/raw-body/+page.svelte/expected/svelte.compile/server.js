import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/load/raw-body/dataview">DataView</a> <a href="/load/raw-body/string">String</a> <a href="/load/raw-body/uint8array">Uint8Array</a>`);
}