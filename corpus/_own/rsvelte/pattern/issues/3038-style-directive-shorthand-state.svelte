<script>
	let color = $state('red');
	let bg = $state('blue');
</script>

<!-- shorthand: reactivity comes from the binding KIND, so an unmutated
     $state still forces the template_effect + styles cache -->
<div style:color>shorthand</div>

<!-- explicit form of the same binding folds as a known constant -->
<div style:background-color={bg}>explicit</div>

<div style:color style:background-color={bg} style:--accent={color} style:opacity|important={0.9}>mixed</div>
