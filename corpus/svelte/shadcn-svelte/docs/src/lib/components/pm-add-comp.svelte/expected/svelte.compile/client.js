import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PMExecute from "./pm-execute.svelte";

export default function Pm_add_comp($$anchor, $$props) {
	{
		let $0 = $.derived(() => `shadcn-svelte@latest add ${$$props.name}`);

		PMExecute($$anchor, {
			get command() {
				return $.get($0);
			}
		});
	}
}