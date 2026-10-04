import * as $ from 'svelte/internal/server';

const value = "a";

export { value as name };

export { other } from "./other.js";

export * from "./x.js";

export default function Module_export($$renderer) {
	$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-1smzd4s')}></p>`);
}
