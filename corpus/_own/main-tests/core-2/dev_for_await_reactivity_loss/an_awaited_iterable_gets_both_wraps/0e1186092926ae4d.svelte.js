export async function run() {
	for await (const x of await gen()) {
		use(x);
	}
}
