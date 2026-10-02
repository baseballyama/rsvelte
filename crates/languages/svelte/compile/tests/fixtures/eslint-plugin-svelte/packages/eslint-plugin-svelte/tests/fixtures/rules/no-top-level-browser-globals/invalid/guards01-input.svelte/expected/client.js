import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Guards01_input($$anchor) {
	if (typeof window !== 'undefined') {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}

	if (typeof document !== 'undefined') {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}

	if (typeof location !== 'undefined') {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}

	if (typeof location === 'undefined') {
		console.log(location.href); // NG
	} else {
		console.log(location.href);
	}

	if (typeof location !== 'object') {
		console.log(location.href); // NG
	} else {
		console.log(location.href);
	}

	if (typeof location === 'object') {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}

	if (typeof location != 'undefined') {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}

	if (typeof location == 'undefined') {
		console.log(location.href); // NG
	} else {
		console.log(location.href);
	}

	if (typeof location != 'object') {
		console.log(location.href); // NG
	} else {
		console.log(location.href);
	}

	if (typeof location == 'object') {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}

	if ('undefined' !== typeof window) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
}