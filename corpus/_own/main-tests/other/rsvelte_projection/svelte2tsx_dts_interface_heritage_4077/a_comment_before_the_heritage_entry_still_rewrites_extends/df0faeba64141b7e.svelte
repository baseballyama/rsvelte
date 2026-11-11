<script lang="ts">
  interface B { a: string }
  interface C { c: string }
  interface Iface extends /*c*/B { b: string }
  export let x: Iface;
</script>

{x}
