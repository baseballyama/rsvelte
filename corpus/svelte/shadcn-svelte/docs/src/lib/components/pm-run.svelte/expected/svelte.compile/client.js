import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PMBlock from "./pm-block.svelte";

export default function Pm_run($$anchor, $$props) {
	PMBlock($$anchor, {
		type: 'run',
		get command() {
			return $$props.command;
		}
	});
}