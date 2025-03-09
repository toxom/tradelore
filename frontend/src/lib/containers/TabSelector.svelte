<script lang="ts">
  import { User, Settings, Lock, ShieldAlert, UserRound } from 'lucide-svelte';

  export let tabs: string[] = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4', 'Tab 5']; // Default tab labels
  export let activeTab: string = tabs[0]; // Initially active tab
  export let tabIcons: any[] = [UserRound, Settings, Lock, ShieldAlert]; // Default icons matching your profile tabs
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function selectTab(tab: string) {
    activeTab = tab;
    dispatch('tabChange', { tab }); // Dispatch an event when tab changes
  }
</script>

<div class="tab-selector">
  {#each tabs as tab, i (tab)}
    <button
      class="tab"
      class:active={activeTab === tab}
      on:click={() => selectTab(tab)}
    >
      {#if i < tabIcons.length}
      
        <svelte:component this={tabIcons[i]} />
      {/if}
      <span class="tab-text">{tab}</span>
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
    width: 100%;
    justify-content: center;
    position: sticky;
    top: 0;
    user-select: none;
  }

  .tab {
    padding: 10px 15px;
    margin-top: 1rem;
    border: none;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    background: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 1.25rem;
    transition: all 0.2s ease;
    border-top: 2px solid transparent;
    border-left: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent; 
    color: var(--tertiary-color);
    transition: all 0.2s ease-in-out;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .tab.active {
    color: var(--text-color);
    border-bottom: 2px solid var(--text-color); 
  }
  
  .tab-text {
    display: inline-block;
  }
  
  @media (max-width: 1000px) {
    .tab-text {
      display: none;
    }
    
    .tab {
      padding: 2rem;
      margin-top: 3rem;
    }
  }
</style>