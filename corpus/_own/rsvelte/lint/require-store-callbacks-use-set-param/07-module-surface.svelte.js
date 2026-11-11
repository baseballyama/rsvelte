import { readable as make } from 'svelte/store';

export const clock = make(Date.now(), (tick) => {
	const id = setInterval(() => tick(Date.now()), 1000);
	return () => clearInterval(id);
});
