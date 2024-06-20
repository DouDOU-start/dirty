from flask import Flask, jsonify, request

from construct_logistic_model import calculate_roc
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/calculate_roc', methods=['POST'])
def calculate_roc_route():
    data = request.json
    file_path = data['file_path']
    coef_dict = data['coef_dict']
    intercept = data['intercept']
    target = data['target']
    n_bootstraps = data.get('n_bootstraps', 100)
    rng_seed = data.get('rng_seed', 42)

    results = calculate_roc(file_path, coef_dict, intercept, target, n_bootstraps, rng_seed)
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, use_reloader=False)
    # 注意，如果没有指定use_reloader=False，后续将其打包成exe后，运行exe会产生两个进程，在electron窗口关闭时kill掉进程时，会有一个守护进程无法kill掉