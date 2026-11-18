export function listen(target: EventTarget): void {
	target.addEventListener('change', () => {});
}

export function subscribeGlobal(): void {
	addEventListener('offline', () => {});
}
