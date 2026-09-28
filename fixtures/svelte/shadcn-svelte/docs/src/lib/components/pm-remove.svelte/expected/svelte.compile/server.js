import * as $ from 'svelte/internal/server';
import PMBlock from "./pm-block.svelte";

export default function Pm_remove($$renderer, $$props) {
	let { command } = $$props;

	PMBlock($$renderer, { type: 'uninstall', command });
}