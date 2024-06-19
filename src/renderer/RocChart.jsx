import React, { useState, useRef, useEffect } from 'react';

import Plot from 'react-plotly.js';

import './styles/RocChart.css';




const RocChart = () => {

  const [chartData, setChartData] = useState(null);




  const handleFileOpen = async () => {

    const result = await window.electron.showOpenDialog({

      properties: ['openFile'],

      filters: [{ name: 'JSON Files', extensions: ['json'] }],

    });




    if (result.canceled) {

      return;

    }




    const filePath = result.filePaths[0];

    loadData(filePath);

  };




  const loadData = async (filePath) => {

    const data = await window.electron.readFile(filePath);

    const results = JSON.parse(data);




    const traces = results.bootstrapped_fpr.map((fpr, index) => ({

      x: fpr,

      y: results.bootstrapped_tpr[index],

      mode: 'lines',

      name: `Bootstrap ${index + 1}`,

      line: { color: 'grey', width: 1 }

    }));




    traces.push({

      x: results.mean_fpr,

      y: results.mean_tpr,

      mode: 'lines',

      name: `Mean ROC (area = ${results.mean_auc.toFixed(2)})`,

      line: { color: 'blue', width: 2 }

    });




    traces.push({

      x: [0, 1],

      y: [0, 1],

      mode: 'lines',

      name: 'Random Chance',

      line: { dash: 'dash', color: 'black', width: 2 }

    });




    setChartData(traces);

  };




  return (

    <div className="roc-chart-container">

      <h1>Bootstrap ROC Curves for Cox Regression Model</h1>

      <div className="button-container">

        <button onClick={handleFileOpen}>Open JSON File</button>

      </div>

      <div className="chart-wrapper">

        {chartData ? (

          <Plot

            data={chartData}

            layout={{

              title: 'Bootstrap ROC Curves for Cox Regression Model',

              xaxis: {

                title: 'False Positive Rate',

                range: [0, 1]

              },

              yaxis: {

                title: 'True Positive Rate',

                range: [0, 1]

              },

              autosize: true,

              width: 1500,

              height: 1500,

              margin: { t: 50, r: 50, b: 50, l: 50 },

              showlegend: true,

              legend: {

                orientation: 'h',

                x: 0,

                y: -0.2

              }

            }}

            useResizeHandler

            style={{ width: '100%', maxWidth: '1000px', height: 'auto' }}

            config={{ responsive: true }}

          />

        ) : (

          'No data loaded.'

        )}

      </div>

    </div>

  );

};


export default RocChart;