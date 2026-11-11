<label>
  <input class="checkbox" />
  <div class="checkbox-element"></div>
  <div class="checkbox-label"></div>
</label>

<style>
	.checkbox {
		& + .checkbox-element {
			color: red;

			& + .checkbox-label {
				color: blue;
			}
		}
	}
</style>
