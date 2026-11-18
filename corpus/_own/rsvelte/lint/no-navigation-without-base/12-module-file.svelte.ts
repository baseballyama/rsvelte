import { goto, pushState, replaceState } from '$app/navigation';
import { base } from '$app/paths';

const state = {};

export function bad(): void {
	goto('/plain');
}

export function good(): void {
	goto(base + '/ok');
}

export function templated(pathname: string): void {
	goto(`${pathname}?x=1`);
}

export function shallow(): void {
	pushState('', state);
	replaceState('/bad-replace', state);
}

export class Holder {
	set target(value: string) {
		goto(`${base}/${value}`);
	}

	set broken(value: string) {
		goto(`/nope/${value}`);
	}
}
