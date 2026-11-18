<div class="host" data-present="yes">
	<span class="under-attr"></span>
	<span class="under-class"></span>
	<span class="under-pseudo"></span>
	<span class="under-present"></span>
</div>

<style>
	.host {
		&[data-absent='no'] {
			.under-attr {
				color: red;
			}
		}
		&.no-such-class {
			.under-class {
				color: red;
			}
		}
		&:hover {
			.under-pseudo {
				color: blue;
			}
		}
		&[data-present='yes'] {
			.under-present {
				color: blue;
			}
		}
	}
</style>
