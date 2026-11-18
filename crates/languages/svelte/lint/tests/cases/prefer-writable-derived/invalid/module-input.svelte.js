let a = 1;
let b = $state(0);
$effect.pre(() => {
	b = a * 2;
});
export { b };
