<script lang="ts">
  import { NETWORK_CLASSES } from '$lib/constants/networks.js';
  import Tooltip from '$lib/components/global/Tooltip.svelte';
  import _SvgIcon from '$lib/components/global/SvgIcon.svelte';
  import Icon from '$lib/components/global/Icon.svelte';
  import '../../styles/converters.scss';
  import '../../styles/components.scss';
</script>

<div class="card">
  <header class="card-header">
    <h2>Network Classes Reference</h2>
    <p>Traditional IP address classes and their characteristics for network planning.</p>
  </header>

  <!-- Network Classes -->
  <div class="reference-section">
    {#each Object.entries(NETWORK_CLASSES) as [className, classInfo] (className)}
      <Tooltip
        text="Class {className} networks use {classInfo.defaultMask} as default subnet mask and support {classInfo.range}"
        position="top"
      >
        <div class="reference-card">
          <div class="card-header-inline">
            <div class="class-info">
              <div class="class-badge {className.toLowerCase()}">
                {className}
              </div>
              <div class="class-details">
                <h3>Class {className}</h3>
                <span class="mask-info">
                  {classInfo.defaultMask} (/{classInfo.cidr})
                </span>
              </div>
            </div>
            <span class="range-badge">
              {classInfo.range.split(' - ')[0]} - {classInfo.range.split(' - ')[1]}
            </span>
          </div>

          <p class="class-description">
            {classInfo.description}
          </p>

          <p class="usage-info">
            <strong>Typical Usage:</strong>
            {classInfo.usage}
          </p>
        </div>
      </Tooltip>
    {/each}
  </div>

  <!-- Quick Tips -->
  <section class="tips-section">
    <h4 class="tips-header">
      <Icon name="info" size="md" />
      Understanding Network Classes
    </h4>
    <div class="tips-content">
      <p>
        <strong>Historical Context:</strong> Network classes were the original method of IP address allocation, now largely
        replaced by CIDR (Classless Inter-Domain Routing) for more efficient address utilization.
      </p>
      <ul class="tips-list">
        <li>• <strong>Class A:</strong> Large networks with millions of hosts (0-127 first octet)</li>
        <li>• <strong>Class B:</strong> Medium networks with thousands of hosts (128-191 first octet)</li>
        <li>• <strong>Class C:</strong> Small networks with up to 254 hosts (192-223 first octet)</li>
        <li>• Classes D and E are reserved for multicast and experimental use</li>
      </ul>
    </div>
  </section>

  <!-- Explainer Section -->
  <div class="explainer-card">
    <h3>
      <Icon name="info" size="md" />
      Network Class Fundamentals
    </h3>
    <div class="explainer-content">
      <p>
        Network classes provide a standardized way to understand IP address ranges and their intended use. While modern
        networks use CIDR notation, understanding classes helps with legacy systems and network analysis.
      </p>
      <div class="class-comparison">
        <h4>Class Comparison</h4>
        <div class="comparison-grid">
          <div class="comparison-item">
            <span class="class-name class-a">Class A</span>
            <span>16.7M networks, 16.7M hosts each</span>
          </div>
          <div class="comparison-item">
            <span class="class-name class-b">Class B</span>
            <span>65K networks, 65K hosts each</span>
          </div>
          <div class="comparison-item">
            <span class="class-name class-c">Class C</span>
            <span>2M networks, 254 hosts each</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
