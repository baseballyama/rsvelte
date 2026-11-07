import * as $ from 'svelte/internal/server';
import { PMCommand } from '$lib/components/ui/pm-command';
import { PersistedState } from 'runed';

export default function Pm_command_persisted_pm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const agent = new PersistedState('user-package-manager', 'npm');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PMCommand($$renderer, {
				command: 'execute',
				args: ['jsrepo', 'add', 'ui/pm-command'],
				class: 'max-w-xl',
				get agent() {
					return agent.current;
				},

				set agent($$value) {
					agent.current = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}