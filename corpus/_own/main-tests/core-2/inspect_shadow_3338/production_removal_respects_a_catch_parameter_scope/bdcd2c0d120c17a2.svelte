<script>

$inspect(0);
function f() {
	try {} catch ($inspect) {
		$inspect(1);
		$inspect.trace(2);
	}
	$inspect(3);
}
f();

</script>
<div>x</div>
