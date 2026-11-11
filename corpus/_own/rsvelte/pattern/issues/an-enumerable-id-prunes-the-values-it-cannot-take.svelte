<script>
	let cond = $state(true);
</script>

<div id={cond ? 'tern-a' : 'tern-b'}></div>
<div id={'or-a' || 'or-b'}></div>
<div id={'lit'}></div>

<span class="anchor"></span>

<style>
	/* Every value the expression can take must survive. */
	#tern-a {
		color: red;
	}
	#tern-b {
		color: red;
	}
	#or-a {
		color: red;
	}
	#or-b {
		color: red;
	}
	#lit {
		color: red;
	}

	/* A value no expression here can produce must prune. This is the half an
	   `id` marked indeterminate keeps, and it is why this file carries no
	   genuinely dynamic id: `has_dynamic_ids` is component-wide, so one
	   `id={expr}` anywhere in the file would suppress it. */
	#never-produced {
		color: green;
	}
	#never-produced + .anchor {
		color: green;
	}

	.anchor {
		color: blue;
	}
</style>
