<script>
class Service {
  data = $state([]);
  getTimeline() {
    const auditTimeline = $derived.by(() => this.data);
    return auditTimeline;
  }
}
</script>