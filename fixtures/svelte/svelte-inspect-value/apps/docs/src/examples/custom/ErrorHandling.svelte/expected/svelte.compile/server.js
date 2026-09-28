import * as $ from 'svelte/internal/server';
import Inspect from '@components/Inspect.svelte';
import ErrorOnHover from './ErrorOnHover.svelte';

export default function ErrorHandling($$renderer) {
	Inspect($$renderer, {
		value: {
			'clickToError👉': 'click me',
			hey: 'dont click me i will error'
		},
		name: 'customString',
		customComponents: { string: [ErrorOnHover] }
	});
}