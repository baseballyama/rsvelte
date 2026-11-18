export function run() {
	for (const x of gen()) {
		use(x);
	}
}
