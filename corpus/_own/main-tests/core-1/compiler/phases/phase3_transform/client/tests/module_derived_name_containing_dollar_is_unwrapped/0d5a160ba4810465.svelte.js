
export function useInterval(callback, delay) {
	const delay$ = $derived(typeof delay === 'function' ? delay() : delay);
	let intervalId;
	function start() { intervalId = setInterval(callback, delay$); }
	return { start };
}
