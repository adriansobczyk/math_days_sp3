from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
import random
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:PF23_admin@localhost/snake_game'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Available math shapes
MATH_SHAPES = ['circle', 'square', 'triangle', 'hexagon', 'pentagon']

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    result = db.Column(db.Integer, default=0)
    bonus = db.Column(db.Integer, default=0)
    task_done = db.Column(db.Boolean, default=False)
    color = db.Column(db.String(20), nullable=False, default='blue')
    shape = db.Column(db.String(20), nullable=False, default='circle')
    
    def __repr__(self):
        return f'<Player {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'result': self.result,
            'bonus': self.bonus,
            'task_done': self.task_done,
            'color': self.color,
            'shape': self.shape
        }

@app.route('/')
def index():
    players = Player.query.order_by(Player.name).all()
    return render_template('index.html', players=players)

@app.route('/api/players', methods=['GET'])
def get_players():
    players = Player.query.all()
    return jsonify([player.to_dict() for player in players])

@app.route('/api/players/<int:player_id>', methods=['PUT'])
def update_player(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.json
    
    if 'result' in data:
        player.result = data['result']
    if 'bonus' in data:
        player.bonus = data['bonus']
    if 'task_done' in data:
        player.task_done = data['task_done']
    
    db.session.commit()
    return jsonify(player.to_dict())

@app.route('/api/roll/<int:player_id>', methods=['POST'])
def roll_dice(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.json
    roll_value = data.get('roll')
    
    # Update player result with exact roll value (1:1 ratio)
    player.result += roll_value
    db.session.commit()
    
    return jsonify({
        'player': player.to_dict(),
        'roll': roll_value
    })

@app.route('/reset', methods=['POST'])
def reset_game():
    players = Player.query.all()
    for player in players:
        player.result = 0
    db.session.commit()
    return jsonify({'success': True})

@app.cli.command("init-db")
def init_db():
    db.drop_all()
    db.create_all()
    
    # Predefined colors
    colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
    
    # Create initial players with unique colors and math shapes
    default_players = [
        {'name': '4a'},
        {'name': '4b'},
        {'name': '4c'},
        {'name': '4d'}
    ]
    
    for i, player_data in enumerate(default_players):
        if not Player.query.filter_by(name=player_data['name']).first():
            player = Player(
                name=player_data['name'],
                color=colors[i % len(colors)],
                shape=random.choice(MATH_SHAPES)
            )
            db.session.add(player)
    
    db.session.commit()
    print("Database initialized with default players")

if __name__ == '__main__':
    app.run(debug=True)
