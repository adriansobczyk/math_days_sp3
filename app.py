from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

app = Flask(__name__, static_url_path='/static')
app.config['SECRET_KEY'] = '7$p*sbypsggppwg+pfq=yvim4m&cfq#ybu7!m&akx%x+&u*4k-'
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

from routes import *
from models import *
from commands import *

if __name__ == '__main__':
    app.run(debug=True)