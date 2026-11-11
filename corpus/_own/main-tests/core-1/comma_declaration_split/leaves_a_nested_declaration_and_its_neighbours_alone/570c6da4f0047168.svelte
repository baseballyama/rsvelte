<script>
let a = $state(1), b = $state(2);
function f() {
	let c = 1, d = 2;
	return c + d;
}
const tpl = `a
	b`;
</script>
{a}{b}{f()}{tpl}