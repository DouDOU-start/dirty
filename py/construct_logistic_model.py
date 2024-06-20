import pandas as pd
import numpy as np
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
from sklearn.utils import resample
import json

# 定义逻辑回归模型类
class LogisticRegressionModel:
    def __init__(self, intercept, coefs):
        self.intercept = intercept
        self.coefs = coefs
    
    def predict_proba(self, X):
        log_odds = self.intercept
        for feature, coef in self.coefs.items():
            log_odds += coef * X[feature]
        probability = 1 / (1 + np.exp(-log_odds))
        return probability

def calculate_roc(file_path, coef_dict, intercept, target, n_bootstraps=1000, rng_seed=42):
    # 加载数据
    data = pd.read_excel(file_path)

    # 提取特征和目标变量
    features = list(coef_dict.keys())
    X = data[features]
    y = data[target]

    # 创建模型实例
    model = LogisticRegressionModel(intercept, coef_dict)

    # 设置Bootstrap样本数量
    bootstrapped_scores = []
    tprs = []
    mean_fpr = np.linspace(0, 1, 100)

    for i in range(n_bootstraps):
        # 生成Bootstrap样本
        X_resampled, y_resampled = resample(X, y, random_state=rng_seed + i)
        
        # 在原始数据集上预测，计算ROC曲线
        y_pred = model.predict_proba(X_resampled)
        fpr, tpr, _ = roc_curve(y_resampled, y_pred)
        tprs.append(np.interp(mean_fpr, fpr, tpr))
        tprs[-1][0] = 0.0
        roc_auc = auc(fpr, tpr)
        bootstrapped_scores.append(roc_auc)

    # 计算平均ROC曲线
    mean_tpr = np.mean(tprs, axis=0)
    mean_tpr[-1] = 1.0
    mean_auc = auc(mean_fpr, mean_tpr)
    std_auc = np.std(bootstrapped_scores)

    # 构建返回的 JSON 数据
    results = {
        'mean_auc': mean_auc,
        'std_auc': std_auc,
        'roc_curves': []
    }

    for i in range(n_bootstraps):
        result = {
            'tpr': tprs[i].tolist(),
            'fpr': mean_fpr.tolist(),
            'auc': bootstrapped_scores[i]
        }
        results['roc_curves'].append(result)
    
    return results

def plot_roc(results):
    plt.figure(figsize=(10, 8))
    
    # 绘制所有的 ROC 曲线
    for idx, curve in enumerate(results['roc_curves']):
        plt.plot(curve['fpr'], curve['tpr'], color='grey', alpha=0.3, label=f'ROC curve {idx + 1} (area = {curve["auc"]:.2f})' if idx < 10 else "")
    
    # 绘制平均 ROC 曲线
    plt.plot([0, 1], [0, 1], 'k--', lw=2)
    mean_tpr = np.mean([curve['tpr'] for curve in results['roc_curves']], axis=0)
    mean_fpr = np.linspace(0, 1, 100)
    plt.plot(mean_fpr, mean_tpr, color='blue', label=f'Mean ROC (area = {results["mean_auc"]:.2f})', lw=2)
    
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Bootstrap ROC Curves')
    plt.legend(loc='lower right')
    plt.show()

if __name__ == "__main__":
    file_path = '/Users/allen/Desktop/死亡危险因素及预测模型.xlsx'
    coef_dict = {
        '甘油三酯': -0.324,
        '校正钙': 1.381,
        '血肌酐': -0.002,
        '既往CVD病史（有1，无0）': 0.754
    }
    intercept = -2.225
    target = '2年内是否死亡（1是、0否）'
    results = calculate_roc(file_path, coef_dict, intercept, target)
    plot_roc(results)
    print(json.dumps(results, indent=4))