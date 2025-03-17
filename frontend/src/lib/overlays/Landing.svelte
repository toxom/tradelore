<script lang="ts">
    import { fade, fly, slide } from 'svelte/transition';
    import { Book, Brain, Globe2, Languages, MessageCircle } from 'lucide-svelte';
	import { t } from '../../stores/translation.store';
    import Auth from '../containers/Auth.svelte'
    let isVisible = false;
    const youtubeUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";

    $: features = [
        {
            icon: Book,
            heading: 'feature1',
            description: $t('landing.features.feature1.description')
        },
        {
            icon: Brain,
            heading: 'feature2',
            description: $t('landing.features.feature2.description') 
        },
        {
            icon: MessageCircle,
            heading: 'feature3',
            description: $t('landing.features.feature2.description') 
        },
        {
            icon: MessageCircle,
            heading: 'feature3',
            description: $t('landing.features.feature2.description') 
        }
    ];

    setTimeout(() => {
        isVisible = true;
    }, 100);
</script>

<div class="landing-container" transition:fade={{ duration: 300 }}>
    {#if isVisible}
        <div class="section">
            <div class="hero-section" transition:fly={{ y: 50, duration: 500 }}>
                    <span>
                        <h1>{$t('landing.title')}</h1>
                        <h2>{$t('landing.hero')}</h2>

                    </span>
                <div class="video-container" transition:slide>
                    <iframe
                        transition:fly={{ y: 20, duration: 300 }}
                        width="560"
                        height="315"
                        src={youtubeUrl}
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            </div>
            <!-- <div class="start-section" transition:fly={{ y: 50, duration: 500, delay: 600 }}>
                <h2>{$t('landing.cta')}</h2>
                <p>{$t('landing.learn')}</p>
                <div class="arrow-indicator">↓</div>
            </div> -->
        </div>
        <div class="section">
            <div class="hero-section reverse" transition:fly={{ y: 50, duration: 500 }}>
                <span>
                    <h1 >{$t('landing.catalog')}</h1>
                </span>
            </div>
            <div class="features-grid">
                {#each features as feature, i}
                    <div 
                        class="feature-card"
                        transition:fly={{ 
                            y: 50,
                            duration: 500,
                            delay: 200 + i * 100
                        }}
                    >

                        <h3>{$t(`landing.features.${feature.heading.toLowerCase()}.heading`)}</h3>
                        <p>{feature.description}</p>
                    </div>
                {/each}
            </div>
        </div>
        <div class="section">
            <span class='row'>
                <h3>{$t('landing.join')} - {$t('landing.join2')}</h3>
            </span>
            <div class="hero-section" transition:fly={{ y: 50, duration: 500 }}>
            </div>
            <Auth/>
        </div>
    {/if}
</div>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }     
    
    .landing-container {
        margin-top: 4rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: top;
        color: var(--text-color);
        // background: var(--bg-gradient-r);
        max-width: 1600px;
        top: 0;
        left: 50%;
        bottom: 5rem;
        transform: translateX(-50%); 
        width: 100%; 
        height: calc(100vh - 7rem);
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
		scrollbar-width: thick;
		scrollbar-color: gray transparent;
        background: var(--bg-gradient-fade);
    }

    .section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 1rem;
        width: 100%;
        &.reverse {
            background: linear-gradient(to left, rgb(55, 42, 42), rgb(35, 21, 21));
            border-radius: 4rem;
            width: 96%;
            margin-left: 2%;
        }

    }

    span.row {
        display: flex;
        flex-direction: column;
        font-size: 2rem;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        height: 40px;
    }

    .hero-section {
        display: flex;
        flex-direction: row;
        text-align: center;
        justify-content: center;
        align-items: top;
        gap: 2rem;
        height: auto;
        width: 80%;
        top: 0;
        margin-bottom: 2rem;
        &.reverse {
            align-items: center;
            justify-content: center;
            & span {
                width: auto;
                margin-left: 2rem;
                text-align: center;
                h1 {
                    font-size: 2.5rem;
                }

            }
        }
        & span {
            display: flex;
            flex-direction: column;
            width: 50%;
            height:auto;
            gap: 0;
            h1 {
                font-size: 5rem;
                font-weight: 700;
                margin: 0;
                height: 100%;
                margin-left: 1rem;
                text-align: left;
                background: var(--text-color);
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h2 {
                font-size:2.5rem;
                text-align: left;
                margin-left: 1rem;
                
            }
            h3 {
                font-size: 2.5rem;
                text-align: left;
                margin-left: 1rem;
                font-weight: 400;

            }
        }

    }
	.video-container {
		// width: 50%;
		right: 0;
		top: 1rem;
        height: auto;
		position: relative;
		overflow: hidden;
		pointer-events: auto;
		iframe {
			border-radius: 1rem;
			border: 1px solid rgba(255, 255, 255, 0.2);
		}
	}
    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        width: 90%;
        max-width: 1200px;
        margin-bottom: 4rem;
    }
    
    .feature-card {
        background: var(--bg-gradient-r);
        padding: 2rem;
        border-radius: 12px;
        text-align: left;
        box-shadow: 0 10px 0px rgba(0, 0, 0, 0.1); 

        transition: transform 0.3s ease, background 0.3s ease;

        &:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.1);
        }

        .icon-wrapper {
            background: rgba(76, 175, 80, 0.1);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem auto;
            color: #4CAF50;
        }

        h3 {
            font-size: 1.5rem;
            margin: 0 0 1rem 0;
            color: var(--accent1);
        }

        p {
            font-size: 1rem;
            color: var(--text-color);
            margin: 0;
            line-height: 1.5;
        }
    }

    .start-section {
        text-align: center;
        margin-top: 2rem;

        h2 {
            font-size: 2rem;
            color: #4CAF50;
            margin: 0 0 1rem 0;
        }

        p {
            font-size: 1.2rem;
            color: #e0e0e0;
            margin: 0;
        }

        .arrow-indicator {
            font-size: 2rem;
            color: #4CAF50;
            margin-top: 1rem;
            animation: bounce 2s infinite;
        }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }

    @media (max-width: 1600px) {
        .video-container {
		width: 100%;
        height: 100;
		right: 0;
		top: 0;
        height: auto;
		position: relative;
		overflow: hidden;
		pointer-events: auto;
        padding-top: 56.25%; /* 16:9 Aspect Ratio */
		iframe {
			position: absolute;
			top: 0%;
			left: 5%;
			width: 90%;
			height: 90%;

			border-radius: 1rem;
			border: 1px solid rgba(255, 255, 255, 0.2);
		}
	}
        .hero-section {
            flex-direction: column;
            &.reverse {
                align-items: center;
                justify-content: center;
                width: 80%;
                & span {
                    width: auto;
                    text-align: center;
                    h1 {
                        font-size: 2rem;
                    }

                }
            }
            & span {
                width: 90%;
                margin-left: 5%;
                h1 {
                    text-align: center;
                    font-size: 3rem;
                }
                h2 {
                    text-align: center;
                    font-size: 2rem;

                }
                h3 {
                    font-size: 1.5rem;
                    text-align: left;
                    margin-left: 1rem;
                }
            }

        }

        .feature-card {
            padding: 1.5rem;
        }

        .start-section {
            h2 {
                font-size: 1.5rem;
            }
            p {
                font-size: 1rem;
            }
        }
        span.row {
            display: flex;
            flex-direction: column;
            font-size: 2rem;
            justify-content: center;
            align-items: center;
            text-align: center;
            gap: 2rem;
            width: 90%;
        }
    }
</style>