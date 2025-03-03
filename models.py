from app import db

MATH_SHAPES = [
    'circle', 'square', 'triangle', 'hexagon', 'pentagon', 
    'star', 'diamond', 'heart', 'cross', 'ellipse', 
    'rectangle', 'trapezoid', 'parallelogram', 'rhombus', 'kite', 
    'octagon', 'decagon', 'crescent', 'arrow', 'cylinder', 'cube'
]

COLORS = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 
    'pink', 'brown', 'cyan', 'magenta', 'teal', 'lime', 
    'indigo', 'violet', 'maroon', 'olive', 'navy', 'coral', 
    'gold', 'silver', 'gray'
]

task_names = {
    1: "Zadanie 1",
    2: "Zadanie 2",
    3: "Zadanie 3",
    4: "Zadanie 4",
    5: "Zadanie 5"
}

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    result = db.Column(db.Integer, default=0)
    bonus = db.Column(db.String(100), default='')
    task_done = db.Column(db.Boolean, default=False)
    color = db.Column(db.String(20), nullable=False, default='blue')
    shape = db.Column(db.String(20), nullable=False, default='circle')
    current_cell = db.Column(db.Integer, nullable=True)
    
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
            'shape': self.shape,
            'current_cell': self.current_cell
        }

class PlayerTask(db.Model):
    __tablename__ = 'player_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    task_id = db.Column(db.Integer, nullable=False)
    task_status = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, default=db.func.now())
    
    player = db.relationship('Player', backref=db.backref('tasks', lazy=True))
    
    def __repr__(self):
        return f'<PlayerTask {self.player_id} - Task {self.task_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'task_id': self.task_id,
            'task_status': self.task_status,
            'completed_at': self.completed_at
        }

class PlayerSentence(db.Model):
    __tablename__ = 'player_sentences'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    sentence = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    player = db.relationship('Player', backref=db.backref('sentences', lazy=True))
    
    def __repr__(self):
        return f'<PlayerSentence {self.player_id} - Sentence {self.sentence}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'sentence': self.sentence,
            'created_at': self.created_at
        }

class CorrectSentence(db.Model):
    __tablename__ = 'correct_sentences'
    
    id = db.Column(db.Integer, primary_key=True)
    correct_sentence = db.Column(db.String(255), nullable=False)
    cell_number = db.Column(db.Integer, nullable=False)
    classroom = db.Column(db.String(50), nullable=False)
    
    def __repr__(self):
        return f'<CorrectSentence {self.cell_number} - {self.correct_sentence}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'correct_sentence': self.correct_sentence,
            'cell_number': self.cell_number,
            'classroom': self.classroom
        }

class PlayerCode(db.Model):
    __tablename__ = 'player_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    sentence = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    player = db.relationship('Player', backref=db.backref('codes', lazy=True))
    
    def __repr__(self):
        return f'<PlayerCode {self.player_id} - Sentence {self.sentence}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'sentence': self.sentence,
            'created_at': self.created_at
        }

class CorrectCode(db.Model):
    __tablename__ = 'correct_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(255), nullable=False)
    bonus_type = db.Column(db.String(255), nullable=False)
    sentence = db.Column(db.String(255), nullable=False)
    
    def __repr__(self):
        return f'<CorrectCode {self.subject}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'subject': self.subject,
            'bonus_type': self.bonus_type,
            'sentence': self.sentence
        }