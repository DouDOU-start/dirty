import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './styles/RocChart.css'; // 引入 CSS 文件

const RocChart = () => {
    const [data, setData] = useState(null);
    const [formData, setFormData] = useState({
        filePath: '/Users/allen/Desktop/死亡危险因素及预测模型.xlsx',
        coefDict: {
            '甘油三酯': -0.324,
            '校正钙': 1.381,
            '血肌酐': -0.002,
            '既往CVD病史（有1，无0）': 0.754
        },
        intercept: -2.225,
        target: '2年内是否死亡（1是、0否）',
        nBootstraps: 1000,
        rngSeed: 42
    });
    const [newCoefKey, setNewCoefKey] = useState('');
    const [newCoefValue, setNewCoefValue] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCoefChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            coefDict: {
                ...prev.coefDict,
                [name]: value
            }
        }));
    };

    const handleAddCoef = (e) => {
        e.preventDefault();
        if (newCoefKey && newCoefValue) {
            setFormData((prev) => ({
                ...prev,
                coefDict: {
                    ...prev.coefDict,
                    [newCoefKey]: newCoefValue
                }
            }));
            setNewCoefKey('');
            setNewCoefValue('');
        }
    };

    const handleDeleteCoef = (key) => {
        setFormData((prev) => {
            const newCoefDict = { ...prev.coefDict };
            delete newCoefDict[key];
            return { ...prev, coefDict: newCoefDict };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5001/calculate_roc', {
                file_path: formData.filePath,
                coef_dict: Object.fromEntries(
                    Object.entries(formData.coefDict).map(([k, v]) => [k, parseFloat(v)])
                ),
                intercept: parseFloat(formData.intercept),
                target: formData.target,
                n_bootstraps: parseInt(formData.nBootstraps),
                rng_seed: parseInt(formData.rngSeed)
            });
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const linspace = (start, end, num) => {
        const step = (end - start) / (num - 1);
        return Array.from({ length: num }, (_, i) => start + i * step);
    };

    const calculateMeanTpr = (rocCurves) => {
        const meanFpr = linspace(0, 1, 100);
        const n = rocCurves.length;
        const meanTpr = meanFpr.map((_, i) => 
            rocCurves.reduce((sum, curve) => sum + curve.tpr[i], 0) / n
        );
        return { meanFpr, meanTpr };
    };

    return (
        <div className="container">
            <div className="form-container">
                <h1>ROC Curve</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            File Path:
                            <input type="text" name="filePath" value={formData.filePath} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Intercept:
                            <input type="text" name="intercept" value={formData.intercept} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Target:
                            <input type="text" name="target" value={formData.target} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Number of Bootstraps:
                            <input type="number" name="nBootstraps" value={formData.nBootstraps} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            RNG Seed:
                            <input type="number" name="rngSeed" value={formData.rngSeed} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="form-group">
                        <h3>Coefficients</h3>
                        {Object.keys(formData.coefDict).map((key) => (
                            <div className="coef-group" key={key}>
                                <label>
                                    {key}:
                                    <input type="text" name={key} value={formData.coefDict[key]} onChange={handleCoefChange} />
                                    <button type="button" className="delete-button" onClick={() => handleDeleteCoef(key)}>Delete</button>
                                </label>
                            </div>
                        ))}
                        <div className="new-coef-group">
                            <input
                                type="text"
                                placeholder="New Coefficient Key"
                                value={newCoefKey}
                                onChange={(e) => setNewCoefKey(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="New Coefficient Value"
                                value={newCoefValue}
                                onChange={(e) => setNewCoefValue(e.target.value)}
                            />
                            <button onClick={handleAddCoef} className="add-coef-button">Add Coefficient</button>
                        </div>
                    </div>
                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
            <div className="plot-container">
                {data && (
                    <Plot
                        data={[
                            // 渲染所有的 ROC 曲线，并显示 AUC
                            ...data.roc_curves.map((curve, index) => ({
                                x: curve.fpr,
                                y: curve.tpr,
                                type: 'scatter',
                                mode: 'lines',
                                marker: { color: 'grey' },
                                opacity: 0.3,
                                showlegend: index < 10,
                                name: `ROC curve ${index + 1} (area = ${curve.auc.toFixed(2)})`
                            })),
                            // 渲染平均 ROC 曲线
                            {
                                x: calculateMeanTpr(data.roc_curves).meanFpr,  // 平均 FPR 轴
                                y: calculateMeanTpr(data.roc_curves).meanTpr,  // 平均 TPR 轴
                                type: 'scatter',
                                mode: 'lines',
                                marker: { color: 'blue' },
                                name: `Mean ROC (area = ${data.mean_auc.toFixed(2)})`
                            },
                            // 渲染随机曲线
                            {
                                x: [0, 1],
                                y: [0, 1],
                                type: 'scatter',
                                mode: 'lines',
                                line: {
                                    dash: 'dash',
                                    color: 'gray'
                                },
                                name: 'Random'
                            }
                        ]}
                        layout={{
                            width: 800,
                            height: 600,
                            title: `Mean ROC (area = ${data.mean_auc.toFixed(2)})`,
                            xaxis: {
                                title: 'False Positive Rate',
                            },
                            yaxis: {
                                title: 'True Positive Rate',
                            },
                            legend: {
                                orientation: 'v',
                                x: 1.1,
                                y: 1
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default RocChart;