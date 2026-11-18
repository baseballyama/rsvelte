let src = $state(0);
let dest = $state(0);

$effect(() => {
	dest = src * 3;
});

export function read() {
	return dest;
}
