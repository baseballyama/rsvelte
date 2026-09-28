import * as $ from 'svelte/internal/server';
import PMExecute from "./pm-execute.svelte";

export default function Pm_add_comp($$renderer, $$props) {
	let { name } = $$props;

	PMExecute($$renderer, { command: `shadcn-svelte@latest add ${name}` });
}