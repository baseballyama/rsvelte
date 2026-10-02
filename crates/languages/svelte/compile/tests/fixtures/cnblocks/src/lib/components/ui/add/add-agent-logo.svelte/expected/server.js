import * as $ from 'svelte/internal/server';
import PnpmLogo from "$lib/components/logos/pnpm.svelte";
import NpmLogo from "$lib/components/logos/npm.svelte";
import YarnLogo from "$lib/components/logos/yarn.svelte";
import BunLogo from "$lib/components/logos/bun.svelte";

export default function Add_agent_logo($$renderer, $$props) {
	let { agent, class: className } = $$props;

	if (agent === "pnpm") {
		$$renderer.push('<!--[0-->');
		PnpmLogo($$renderer, { class: className });
	} else if (agent === "npm") {
		$$renderer.push('<!--[1-->');
		NpmLogo($$renderer, { class: className });
	} else if (agent === "yarn") {
		$$renderer.push('<!--[2-->');
		YarnLogo($$renderer, { class: className });
	} else if (agent === "bun") {
		$$renderer.push('<!--[3-->');
		BunLogo($$renderer, { class: className });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}