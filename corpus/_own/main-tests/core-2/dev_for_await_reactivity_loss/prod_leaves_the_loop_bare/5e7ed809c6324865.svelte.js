export async function run() {
	for await (const x of gen()) {
		use(x);
	}
}
