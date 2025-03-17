<script lang="ts">
	import { Compass } from 'lucide-svelte';
    export let companyName = 'Magellan';
    export let year = new Date().getFullYear();
    import { t } from '../../stores/translation.store';

    let footerHeight = '3rem';
    let footerWidth = '100%';

    let tooltipVisible = false;
    let tooltip = '';
    let tooltipPosition = { x: 0, y: 0 };
    
    interface FooterSection {
      title: string;
      links: { text: string; href: string; }[];
    }
    
    $: footerSections = [
        {
            title: $t('footer.about.title'),
            links: [
                { text: $t('footer.about.whyMagellan'), href: '/why-xhk' },
                { text: $t('footer.about.howItWorks'), href: '/how-it-works' },
                { text: $t('footer.about.knowledgeBase'), href: '/knowledge' },
                { text: $t('footer.about.transparency'), href: '/transparency' },
                { text: $t('footer.about.fees'), href: '/fees' }
            ]
        },
        {
            title: $t('footer.services.title'),
            links: [
                { text: $t('footer.services.spotTrading'), href: '/spot-trading' },
                { text: $t('footer.services.marginTrading'), href: '/margin-trading' },
                { text: $t('footer.services.futuresTrading'), href: '/futures-trading' },
                { text: $t('footer.services.stakingLending'), href: '/staking-lending' },
                { text: $t('footer.services.portfolioTools'), href: '/portfolio-tools' },
                { text: $t('footer.services.tradingBots'), href: '/trading-bots' },
                { text: $t('footer.services.apiAccess'), href: '/api' },
                { text: $t('footer.services.educationalResources'), href: '/education' },
                { text: $t('footer.services.securityCustody'), href: '/security' }
            ]
        },
        {
            title: $t('footer.solutions.title'),
            links: [
                { text: $t('footer.solutions.individuals'), href: '/individuals' },
                { text: $t('footer.solutions.merchants'), href: '/merchants' },
                { text: $t('footer.solutions.exchanges'), href: '/exchanges' }
            ]
        }
    ];
    
    function handleClickFooter(e: MouseEvent) {
      if ((e.target as HTMLElement).tagName === 'FOOTER') {
        tooltip = footerHeight === '6rem' ? 'Footer collapsed' : 'Footer expanded';
        tooltipVisible = true;
        tooltipPosition = {
          x: e.clientX,
          y: e.clientY
        };
        footerHeight = footerHeight === '3rem' ? '6rem' : '3rem';
        footerWidth = footerWidth === 'auto' ? '100%' : 'auto';

        setTimeout(() => {
          tooltipVisible = false;
        }, 1500);
      }
    }
    </script>
    <footer 
      class="footer"
      style="height: {footerHeight}; width: {footerWidth}"
      on:mouseenter={() => {
          footerHeight = '50%';
          footerWidth = '100%';
      }}
      on:mouseleave={() => {
          footerHeight = '3rem';
          footerWidth = 'auto';
      }}
      on:click={handleClickFooter}
      >
      <div class="content">
        <span class='logo'>
          <Compass size={20} />
          <h1>
            Magellan
          </h1>
        </span>
        <div class="footer-grid">
          <div>
            <!-- <img src={Logo1} alt="Logo" /> -->
          </div>
          
          {#each footerSections as section}
            <div class="footer-section">
              <h3>{section.title}</h3>
              <ul>
                {#each section.links as link}
                  <li><a href={link.href}>{link.text}</a></li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
        <p>© {year} {companyName}. {$t('footer.rights')}</p>
      </div>
    {#if tooltipVisible}
    <div 
       class="tooltip"
       style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px"
     >
    {tooltip}
    </div>
    {/if}
    </footer>

    <style lang="scss">
    .footer {
      padding:  0;
      background:var(--bg-gradient);
      text-align: center;
      position: fixed;
      align-items: center;
      bottom: 0;
      left: 0;
      // left: calc(50% - 450px);
      right: 0;
      transition: height 0.3s ease;
      overflow: hidden;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      border-top: 1px solid;
      border-color: var(--bg-color);
      z-index: 21;
      // max-width: 900px;

    }
    .content {
      margin: 0 auto;
      padding: 0 1rem;
      & h2 {
        color: var(--text-color);
        }
    }
    .footer-grid {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: top;
      width: 100%;
      gap: 2rem;
      text-align: left;
      margin-bottom: 2rem;
    }
    .footer-section h3 {
        color: var(--text-color);
      margin-bottom: 1rem;
      font-weight: bold;
    }
    .footer-section ul {
      list-style: none;
      padding: 0;
    }
    .footer-section li {
      margin-bottom: 0.5rem;
    }
    .footer-section a {
      color: #666;
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-section a:hover {
      color: #333;
    }
    p {
        color: var(--text-color);
    }
    .tooltip {
      position: fixed;
      background: rgba(0, 0, 0, 0.8);
      color: var(--text-color);
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      transform: translate(-50%, -50%);
      z-index: 1000;
      animation: fadeIn 0.2s;
    }


	span.logo {
		display: flex;
		flex-direction: row;
		height: 3rem;
		margin: 0;
		gap: 1rem;
    width: 100%;
		justify-content: center;
		align-items: center;
		color: var(--text-color);
    h1 {
      font-size: 1.5rem;
    }
	}
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 1600px) {

      .footer-grid {
        flex-direction: column;
        gap: 0;
      }
      span.logo {
        h1 {
          width: auto;
        }
      }
      
    }


    @media (max-width: 768px) {
      // .footer {
      //   display: none;
      // }
    }
    </style>