let base = $state(1);
export async function go() {
	$inspect.trace();
	const v = await Promise.resolve(base);
	return v;
}
