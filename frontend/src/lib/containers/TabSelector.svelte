<script lang="ts">
    export let tabs: string[] = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4', 'Tab 5']; // Default tab labels
    export let activeTab: string = tabs[0]; // Initially active tab
  
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    function selectTab(tab: string) {
      activeTab = tab;
      dispatch('tabChange', { tab }); // Dispatch an event when tab changes
    }
  </script>
  
  <div class="tab-selector">
    {#each tabs as tab (tab)}
      <button
        class="tab"
        class:active={activeTab === tab}
        on:click={() => selectTab(tab)}
      >
        {tab}
      </button>
    {/each}
  </div>
  
  <style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
    }        
    
    .tab-selector {
      display: flex;
    //   margin-bottom: 2rem;
      width: 100%;
      justify-content: center;
      position: sticky;
      top: 0;
      background-color: var(--primary-color);

    }
  
    .tab {
      padding: 10px 15px;
      border: none;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      background: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 1.5rem;
      transition: all 0.2s ease;
      border-top: 2px solid transparent;
      border-left: 2px solid transparent;
      border-right: 2px solid transparent;
      border-bottom: 2px solid transparent; 

      color: var(--tertiary-color);
      transition: all 0.2s ease-in-out;
    }
  
    .tab.active {
      color: var(--text-color);
      border-bottom: 2px solid var(--text-color); 

    }
  </style>