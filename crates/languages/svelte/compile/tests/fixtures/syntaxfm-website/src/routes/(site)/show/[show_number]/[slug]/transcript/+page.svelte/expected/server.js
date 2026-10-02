import * as $ from 'svelte/internal/server';
import Transcript from '$lib/transcript/Transcript.svelte';

export default function _page($$renderer, $$props) {
	let { data } = $$props;

	let transcript = $.derived(() => data.transcript),
		show = $.derived(() => data.show);

	if (transcript()) {
		$$renderer.push('<!--[0-->');

		Transcript($$renderer, {
			show: show(),
			aiShowNote: show().aiShowNote,
			transcript: transcript()
		});
	} else {
		$$renderer.push(`<!--[-1--><p>Transcript not available yet! We have the AI robots on the job, check back soon!</p>`);
	}

	$$renderer.push(`<!--]-->`);
}