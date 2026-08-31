<div id={dynamicId}></div>
<span class="sibling"></span>

<div class="host"><span id={otherId}></span></div>

<div id={thirdId}><span class="under"></span></div>

<div class={dynamicClass}></div>
<span class="after-class"></span>

<div id="static"></div>
<span class="after-static"></span>

<div id="here"><span class="under-here"></span></div>
<span class="after-here"></span>

<style>
	/* An `id` an expression supplies can be anything at runtime, so each of
	   these must survive — upstream `attribute_matches` treats an
	   indeterminate value as matching. */
	#absent + .sibling {
		color: red;
	}
	#absent ~ .sibling {
		color: red;
	}
	.host:has(#absent) {
		color: red;
	}
	#absent {
		&.no-such-class {
			color: red;
		}
		.under {
			color: blue;
		}
	}

	/* Controls. The class half already had the indeterminacy escape, so it
	   passed while the id half did not; a static id must still prune. */
	.absent-class + .after-class {
		color: green;
	}
	#static + .after-static {
		color: green;
	}

	/* The other direction, which is what an over-wide escape would break: on an
	   element whose id is STATIC, an absent `#id` must still prune. */
	#absent-static + .after-here {
		color: green;
	}
	#absent-static {
		.under-here {
			color: green;
		}
	}
</style>
