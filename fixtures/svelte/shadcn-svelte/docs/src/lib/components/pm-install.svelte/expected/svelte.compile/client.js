import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PMBlock from "./pm-block.svelte";

export default function Pm_install($$anchor, $$props) {
	PMBlock($$anchor, {
		type: 'install',
		get command() {
			return $$props.command;
		}
	});
}