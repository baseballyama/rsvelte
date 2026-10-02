import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PMBlock from "./pm-block.svelte";

export default function Pm_upgrade($$anchor, $$props) {
	PMBlock($$anchor, {
		type: 'upgrade',
		get command() {
			return $$props.command;
		}
	});
}