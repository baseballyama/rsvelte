import * as $ from 'svelte/internal/server';
import { update, release } from './snapshot.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let status = 'idle';
		let captured = 'none';
		let live = 'none';

		$$renderer.push(`<form${$.attributes({
			...update.enhance(async (form) => {
				// take a snapshot of the fields *before* doing any async work
				const data = form.fields.value();

				// the submission is held open by the server, giving the test a window
				// to mutate the form state after the snapshot has been taken
				status = 'submitting';

				await form.submit();
				status = 'done';

				// the snapshot should reflect the values at the time it was taken, not
				// any changes to the form that happened post-submission
				captured = data.a?.b?.c;

				live = form.fields.a.b.c.value();
			})
		})}><input${$.attributes({ ...update.fields.a.b.c.as('text') }, void 0, void 0, void 0, 4)}/> <button>submit</button></form> <form${$.attributes({ ...release })}><button>release</button></form> <p id="status">status: ${$.escape(status)}</p> <p id="captured">captured: ${$.escape(captured)}</p> <p id="live">live: ${$.escape(live)}</p>`);
	});
}