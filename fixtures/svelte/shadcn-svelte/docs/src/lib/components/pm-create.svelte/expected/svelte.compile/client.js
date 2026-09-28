import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PMBlock from "./pm-block.svelte";

export default function Pm_create($$anchor, $$props) {
	PMBlock($$anchor, {
		type: 'create',
		get command() {
			return $$props.command;
		}
	});
}