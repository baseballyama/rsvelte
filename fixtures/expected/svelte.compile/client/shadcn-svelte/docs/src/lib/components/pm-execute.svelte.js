import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PMBlock from "./pm-block.svelte";

export default function Pm_execute($$anchor, $$props) {
	PMBlock($$anchor, {
		type: 'execute',
		get command() {
			return $$props.command;
		}
	});
}