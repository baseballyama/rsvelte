import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '@components/Inspect.svelte';
import ErrorOnHover from './ErrorOnHover.svelte';

export default function ErrorHandling($$anchor) {
	{
		let $0 = $.derived(() => ({ string: [ErrorOnHover] }));

		Inspect($$anchor, {
			value: {
				'clickToError👉': 'click me',
				hey: 'dont click me i will error'
			},
			name: 'customString',
			get customComponents() {
				return $.get($0);
			}
		});
	}
}