<script module>
class SomeLogic {
trigger() { this.someValue++; }
constructor() {
this.someValue = $state(0);
this.isAboveThree = $derived(this.someValue > 3);
}
}
const someLogic = new SomeLogic();
</script>