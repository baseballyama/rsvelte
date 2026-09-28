import * as $ from 'svelte/internal/server';
import PMBlock from "./pm-block.svelte";

export default function Pm_execute($$renderer, $$props) {
	let { command } = $$props;

	PMBlock($$renderer, { type: 'execute', command });
}