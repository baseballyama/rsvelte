<script lang="ts">
  const uid: string = $props.id();
</script>

<form>
  <label for="{uid}-firstname">First Name: </label>
  <input id="{uid}-firstname" type="text" />

  <label for="{uid}-lastname">Last Name: </label>
  <input id="{uid}-lastname" type="text" />
</form>
