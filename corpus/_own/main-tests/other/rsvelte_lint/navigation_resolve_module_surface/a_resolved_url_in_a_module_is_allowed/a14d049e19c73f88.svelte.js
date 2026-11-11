import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
export function fine() {
	return goto(resolve('/ok'));
}
