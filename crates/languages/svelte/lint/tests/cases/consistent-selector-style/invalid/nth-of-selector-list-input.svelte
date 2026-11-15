<li class="a">a</li>
<li class="b" id="c">b</li>

<style>
	li:nth-child(2n of .a, .b) {
		color: red;
	}
	li:nth-last-child(odd of:not(#c)) {
		color: blue;
	}
</style>
