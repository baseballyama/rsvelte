<!-- Both compilers reject this; the position is the comparison. acorn raises
     the strict-mode reserved-word error while reading `public`, a whole
     statement before the one it cannot parse. -->
<script>
	public;
	foo(;
</script>
