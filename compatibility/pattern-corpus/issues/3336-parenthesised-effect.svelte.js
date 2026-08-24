export function go() {
	($effect(() => {
		console.log(1);
	}));
	($effect.pre(() => {
		console.log(2);
	}));
}
