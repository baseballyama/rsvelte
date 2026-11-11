export async function f() {
	return (/* c */ await load())();
	// tail
}
