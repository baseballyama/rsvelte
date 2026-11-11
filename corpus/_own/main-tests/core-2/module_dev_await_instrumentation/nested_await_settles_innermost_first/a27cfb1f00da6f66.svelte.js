export async function f() {
	return await g(await h());
}