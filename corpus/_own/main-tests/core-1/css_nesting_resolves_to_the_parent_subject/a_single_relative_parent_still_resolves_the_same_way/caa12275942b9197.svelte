<label>
  <input class="checkbox" />
  <div class="checkbox-element"></div>
  <div class="checkbox-label"></div>
</label>

<style>
	.checkbox {
		& + .checkbox-label {
			color: blue;
		}
	}
</style>
