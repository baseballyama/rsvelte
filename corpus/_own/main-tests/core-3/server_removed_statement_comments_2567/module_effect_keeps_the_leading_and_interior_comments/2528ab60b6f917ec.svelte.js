export function f(a) {
	// leading
	$effect(() => {
		// interior
		console.log(a);
	});

	console.log(2);
}
