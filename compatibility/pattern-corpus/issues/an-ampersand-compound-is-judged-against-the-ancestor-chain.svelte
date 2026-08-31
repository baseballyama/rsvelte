<script>
	let kind = 'a';
	let on = true;
</script>

<div class="cont kind-{kind}">
	<button class="tab" class:selected={on}></button>
	<button class="tab open"></button>
</div>

<style>
	/* The `kind-{kind}` div can carry any class, so it satisfies `.tab.absent`
	   on its own — but the rule resolves to `.cont .tab.absent`, and that div is
	   not inside a `.cont`. Judging the compound against "some element in the
	   component" instead of against the ancestor chain kept these alive. */
	.cont {
		.tab {
			&.absent { color: red }
		}
	}
	.cont {
		.tab {
			&:disabled,
			&.absent2 { color: red }
		}
	}
	/* Controls. A trailing `&` is a second constraint on the subject rather
	   than a spliced chain, and upstream keeps it even with no `.q` in the
	   component, so a fix that routed every `&` compound through the chain
	   splice would report it. */
	.cont {
		.tab {
			.q & { color: red }
		}
	}

	/* The rest. `selected` comes from a `class:` directive and `open` from the
	   static list, so both compounds are satisfiable by an element that IS a
	   `.tab` inside a `.cont`; the last two pin that a `&` compound naming the
	   subject's own tag or class is not pruned. */
	.cont {
		.tab {
			&.selected { color: red }
			&.open { color: red }
			&button { color: red }
			&.tab { color: red }
		}
	}
</style>
