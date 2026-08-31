<label class="c">
	<input class="box" />
	<div class="el"></div>
	<div class="lab"></div>
</label>

<div class="g">
	<div class="a"><div class="a"></div></div>
	<div class="a2"></div>
</div>

<div class="sidebar"><input /></div>
<div class="sidebar-backdrop"></div>

<style>
	/* A level that opens with `&` names the same element as the level below it. */
	.box {
		&:disabled + .el {
			& + .lab { color: red }
		}
	}
	.c {
		.box {
			&:disabled + .el {
				& + .lab { color: red }
			}
		}
	}
	.a {
		& {
			& + .a2 { color: red }
		}
	}
	.a { & & { color: red } }

	/* A level with no `&` is an implicit descendant and must NOT merge. */
	.g {
		.a {
			& + .a2 { color: red }
		}
	}

	/* The parent level is not structurally evaluable, so its own compounds
	   still have to constrain rather than being dropped. */
	.sidebar:has(input:checked) {
		& + .sidebar-backdrop { color: red }
	}

	/* Negatives: each of these must still be reported. */
	.zzbox {
		&:disabled + .el {
			& + .lab { color: red }
		}
	}
	.box {
		&:disabled + .el {
			& + .zz { color: red }
		}
	}
	.a {
		&.zzz {
			& + .a2 { color: red }
		}
	}
	.g {
		.a {
			& + .zz { color: red }
		}
	}
</style>
