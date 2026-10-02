import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PMBlock from "./pm-block.svelte";

export default function Pm_remove($$anchor, $$props) {
	PMBlock($$anchor, {
		type: 'uninstall',
		get command() {
			return $$props.command;
		}
	});
}