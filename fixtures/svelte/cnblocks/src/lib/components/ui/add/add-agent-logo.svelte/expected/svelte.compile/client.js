import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PnpmLogo from "$lib/components/logos/pnpm.svelte";
import NpmLogo from "$lib/components/logos/npm.svelte";
import YarnLogo from "$lib/components/logos/yarn.svelte";
import BunLogo from "$lib/components/logos/bun.svelte";

export default function Add_agent_logo($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PnpmLogo($$anchor, {
				get class() {
					return $$props.class;
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			NpmLogo($$anchor, {
				get class() {
					return $$props.class;
				}
			});
		};

		var consequent_2 = ($$anchor) => {
			YarnLogo($$anchor, {
				get class() {
					return $$props.class;
				}
			});
		};

		var consequent_3 = ($$anchor) => {
			BunLogo($$anchor, {
				get class() {
					return $$props.class;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.agent === "pnpm") $$render(consequent); else if ($$props.agent === "npm") $$render(consequent_1, 1); else if ($$props.agent === "yarn") $$render(consequent_2, 2); else if ($$props.agent === "bun") $$render(consequent_3, 3);
		});
	}

	$.append($$anchor, fragment);
}