<script>
	function f(x) { return x; }
</script>

<div onClick={() => f(1)}>camelCase</div>
<div onMouseOver={() => f(1)}>another</div>
<div on={f}>the two-character name</div>
<div oN={f}>not a handler — the prefix is case-sensitive</div>
