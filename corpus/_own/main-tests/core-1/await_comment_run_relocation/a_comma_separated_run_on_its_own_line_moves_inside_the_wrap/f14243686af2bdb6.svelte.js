export async function f() {
	g(
		1,
		/* c */ await load()
	);
}
