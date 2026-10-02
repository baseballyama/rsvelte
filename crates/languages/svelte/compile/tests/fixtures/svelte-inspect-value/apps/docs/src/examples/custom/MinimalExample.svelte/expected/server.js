import * as $ from 'svelte/internal/server';
import Inspect from '@components/Inspect.svelte';
import CustomNumber from './CustomNumber.svelte';

export default function MinimalExample($$renderer) {
	const anObject = {
		oneBillion: 1000000000,
		oneTwoThreeFourEtc: 1234567890,
		etc: [Infinity, NaN]
	};

	const customComponents = $.derived(() => ({ number: [CustomNumber] }));

	Inspect($$renderer, {
		class: 'not-content mt',
		value: anObject,
		customComponents: customComponents(),
		name: 'numbersAndColors'
	});
}