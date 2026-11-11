import { goto } from '$app/navigation';
import { base } from '$app/paths';

export function bad() {
	return goto('/module-bad');
}

export function ok() {
	return goto(base + '/module-ok');
}
