<script lang="ts">
    import { onMount } from 'svelte';
    import { ColorType, AreaSeries, createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
	import BorderRadius from '@tabler/icons-svelte/icons/border-radius';

    let chartContainer: HTMLElement | null = null;

    onMount(() => {
        if (chartContainer) {
            // Calculate 90% of the container's width and height
            const containerWidth = chartContainer.clientWidth * 0.9;
            const containerHeight = chartContainer.clientHeight * 0.2;

            const chartOptions = {
                crosshair: {
                    // hide the horizontal crosshair line
                    horzLine: {
                        visible: false,
                        labelVisible: false,
                    },
                    // hide the vertical crosshair label
                    vertLine: {
                        labelVisible: false,
                    },
                },
                // hide the grid lines
                grid: {
                    vertLines: {
                        visible: true,
                    },
                    horzLines: {
                        visible: true,
                    },
                },
                layout: {
                    textColor: 'gray',
                    background: {
                        type: ColorType.Solid,
                        color: 'transparent',
                    },
                    fontSize: 16, 
                    fontFamily: 'Arial, sans-serif',
                    panes: {
                        separatorColor: '#ff0000',
                        separatorHoverColor: '#00ff00',
                        enableResize: false,
                    },
                },
                width: containerWidth, // Set width to 90% of container width
                height: containerHeight, // Set height to 90% of container height
                autoSize: true, // Automatically adjust size to fit the container
            };

            const chart = createChart(document.getElementById('container'), chartOptions);
            const volumeSeries = chart.addSeries(
                HistogramSeries,
                {
                    priceFormat: {
                        type: 'volume',
                    },
                },
                1 // Pane index
            );
            // Moving the series to a different pane
            volumeSeries.moveToPane(2);
            const secondPane = chart.panes()[1];
secondPane.setHeight(300);
secondPane.moveTo(0);
            // Add Area Series
            const areaSeries = chart.addSeries(AreaSeries, {
    topColor: '#2962FF',
    bottomColor: 'rgba(41, 98, 255, 0.28)',
    lineColor: '#2962FF',
    lineWidth: 2,
    
    
});
areaSeries.setData([
    { time: '2018-10-19', value: 52.89 },
    { time: '2018-10-22', value: 55.22 },
    { time: '2018-10-23', value: 57.21 },
    { time: '2018-10-24', value: 57.42 },
    { time: '2018-10-25', value: 56.43 },
    { time: '2018-10-26', value: 55.51 },
    { time: '2018-10-29', value: 56.48 },
    { time: '2018-10-30', value: 58.18 },
    { time: '2018-10-31', value: 57.09 },
    { time: '2018-11-01', value: 56.05 },
    { time: '2018-11-02', value: 56.63 },
    { time: '2018-11-05', value: 57.21 },
    { time: '2018-11-06', value: 57.21 },
    { time: '2018-11-07', value: 57.65 },
    { time: '2018-11-08', value: 58.27 },
    { time: '2018-11-09', value: 58.46 },
    { time: '2018-11-12', value: 58.72 },
    { time: '2018-11-13', value: 58.66 },
    { time: '2018-11-14', value: 58.94 },
    { time: '2018-11-15', value: 59.08 },
    { time: '2018-11-16', value: 60.21 },
    { time: '2018-11-19', value: 60.62 },
    { time: '2018-11-20', value: 59.46 },
    { time: '2018-11-21', value: 59.16 },
    { time: '2018-11-23', value: 58.64 },
    { time: '2018-11-26', value: 59.17 },
    { time: '2018-11-27', value: 60.65 },
    { time: '2018-11-28', value: 60.06 },
    { time: '2018-11-29', value: 59.45 },
    { time: '2018-11-30', value: 60.30 },
    { time: '2018-12-03', value: 58.16 },
    { time: '2018-12-04', value: 58.09 },
    { time: '2018-12-06', value: 58.08 },
    { time: '2018-12-07', value: 57.68 },
    { time: '2018-12-10', value: 58.27 },
    { time: '2018-12-11', value: 58.85 },
    { time: '2018-12-12', value: 57.25 },
    { time: '2018-12-13', value: 57.09 },
    { time: '2018-12-14', value: 57.08 },
    { time: '2018-12-17', value: 55.95 },
    { time: '2018-12-18', value: 55.65 },
    { time: '2018-12-19', value: 55.86 },
    { time: '2018-12-20', value: 55.07 },
    { time: '2018-12-21', value: 54.92 },
    { time: '2018-12-24', value: 53.05 },
]);

            // Add Candlestick Series
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
            }, 1);
            candlestickSeries.setData([
    { time: '2018-10-19', open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
    { time: '2018-10-22', open: 72.16, high: 80.32, low: 32.18, close: 42.12 },
    { time: '2018-10-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
    { time: '2018-10-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
    { time: '2018-10-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
    { time: '2018-10-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
    { time: '2018-10-29', open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
    { time: '2018-10-30', open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
    { time: '2018-10-31', open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
    { time: '2018-11-01', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
    { time: '2018-11-02', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    { time: '2018-11-05', open: 56.02, high: 56.02, low: 56.02, close: 56.02 },
    { time: '2018-11-06', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
    { time: '2018-11-07', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    { time: '2018-11-09', open: 58.46, high: 53.90, low: 32.18, close: 42.12 },
    { time: '2018-11-12', open: 45.12, high: 60.71, low: 45.12, close: 48.09 },
    { time: '2018-11-13', open: 60.71, high: 68.26, low: 53.39, close: 59.29 },
    { time: '2018-11-14', open: 68.26, high: 105.85, low: 59.04, close: 60.50 },
    { time: '2018-11-15', open: 67.71, high: 121.40, low: 66.67, close: 91.04 },
    { time: '2018-11-16', open: 91.04, high: 142.83, low: 82.70, close: 111.40 },
    { time: '2018-11-19', open: 111.51, high: 151.17, low: 103.34, close: 131.25 },
    { time: '2018-11-20', open: 131.33, high: 110.20, low: 77.68, close: 96.43 },
    { time: '2018-11-21', open: 106.33, high: 114.69, low: 90.39, close: 98.10 },
    { time: '2018-11-23', open: 109.87, high: 56.02, low: 85.66, close: 111.26 },
    { time: '2018-11-26', open: 59.17, high: 58.46, low: 56.02, close: 56.02 },
    { time: '2018-11-27', open: 60.65, high: 58.46, low: 90.39, close: 98.10 },
    { time: '2018-11-28', open: 60.06, high: 58.46, low: 85.66, close: 111.26 },
    { time: '2018-11-29', open: 59.45, high: 58.46, low: 58.46, close: 58.46 },
    { time: '2018-11-30', open: 60.30, high: 58.46, low: 58.46, close: 58.46 },
    { time: '2018-12-03', open: 72.16, high: 80.32, low: 32.18, close: 42.12 },
    { time: '2018-12-04', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
    { time: '2018-12-06', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
    { time: '2018-12-07', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
    { time: '2018-12-10', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
    { time: '2018-12-11', open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
    { time: '2018-12-12', open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
    { time: '2018-12-13', open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
    { time: '2018-12-14', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
    { time: '2018-12-17', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    { time: '2018-12-18', open: 56.02, high: 56.02, low: 56.02, close: 56.02 },
    { time: '2018-12-19', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
    { time: '2018-12-20', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    { time: '2018-12-21', open: 58.46, high: 53.90, low: 32.18, close: 42.12 },
    { time: '2018-12-24', open: 45.12, high: 60.71, low: 45.12, close: 48.09 },
]);
const candlesPane = chart.panes()[1];
candlesPane.moveTo(0);
candlesPane.setHeight(containerHeight);
            // Fit content to the chart
            chart.timeScale().fitContent();

            // Handle window resizing
            const handleResize = () => {
                const newWidth = chartContainer.clientWidth * 0.9;
                const newHeight = chartContainer.clientHeight * 0.9;
                chart.applyOptions({ 
                    width: newWidth, 
                    height: newHeight,
                });
            };
            window.addEventListener('resize', handleResize);

            // Cleanup event listener on component destroy
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    });
</script>

<div class="shortcuts">
    Test
</div>
<div id="container" bind:this={chartContainer}>
</div>


<style lang="scss">
        @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
#container {
    width: 94%; /* Set width to 90% of the parent container */
    height: 94%; /* Set a fixed height or use a percentage */
    margin: 0 auto; /* Center the container horizontally */
    padding: 20px; /* Add padding around the chart */
    box-sizing: border-box; /* Include padding in the container's dimensions */
}

    .progress {
        text-align: center;
        color: #666;
    }

    .progress-bar {
        margin-top: 0.5rem;
        height: 4px;
        background-color: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background-color: #3b82f6;
        transition: width 0.3s ease;
    }

    .score {
        text-align: center;
        font-size: 1.2rem;
        font-weight: 500;
        margin-bottom: 1rem;

        .known {
            color: #166534;
        }

        .separator {
            margin: 0 0.5rem;
            color: #666;
        }

        .missed {
            color: #991b1b;
        }
    }

    .game-complete {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        h2 {
            font-size: 2rem;
            color: #1a1a1a;
            margin: 0 0 1rem 0;
        }

        .final-score {
            font-size: 1.5rem;
            margin-bottom: 2rem;

            .known {
                color: #166534;
                font-weight: 500;
            }

            .missed {
                color: #991b1b;
                font-weight: 500;
            }
        }
    }

    .restart-button {
        background-color: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
            background-color: #2563eb;
        }
    }
</style>