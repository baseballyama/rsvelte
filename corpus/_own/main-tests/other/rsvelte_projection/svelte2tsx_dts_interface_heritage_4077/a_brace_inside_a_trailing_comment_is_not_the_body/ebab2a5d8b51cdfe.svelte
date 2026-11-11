<script lang="ts">
  interface B { a: string }
  interface C { c: string }
  interface Iface extends B /*{*/ { b: string }
  export let x: Iface;
</script>

{x}
