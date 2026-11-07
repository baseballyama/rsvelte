import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '@components/Inspect.svelte';
import CustomNumber from './CustomNumber.svelte';

export default function MinimalExample($$anchor) {
	const anObject = {
		oneBillion: 1000000000,
		oneTwoThreeFourEtc: 1234567890,
		etc: [Infinity, NaN]
	};

	const customComponents = $.derived(() => ({ number: [CustomNumber] }));

	Inspect($$anchor, {
		class: 'not-content mt',
		get value() {
			return anObject;
		},

		get customComponents() {
			return $.get(customComponents);
		},
		name: 'numbersAndColors'
	});
}