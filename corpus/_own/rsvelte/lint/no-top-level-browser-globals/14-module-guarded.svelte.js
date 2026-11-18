import { browser } from '$app/environment';

const title = document.title;
const width = browser ? window.innerWidth : 0;
export function guarded() {
	return document.body;
}
void [title, width];
