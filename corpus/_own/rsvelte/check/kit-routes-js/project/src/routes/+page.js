export function load(event) {
	return { greeting: event.params };
}

export function entries() {
	return [{ slug: 'hello-world' }];
}
