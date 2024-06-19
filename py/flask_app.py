from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, use_reloader=False)
    # 注意，如果没有指定use_reloader=False，后续将其打包成exe后，运行exe会产生两个进程，在electron窗口关闭时kill掉进程时，会有一个守护进程无法kill掉