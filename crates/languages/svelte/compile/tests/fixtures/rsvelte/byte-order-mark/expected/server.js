import * as $ from 'svelte/internal/server';

export default function Byte_order_mark($$renderer) {
	let x = "a";
	$$renderer.push(`<!---->﻿ <p>a</p>`);
}
