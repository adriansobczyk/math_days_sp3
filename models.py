from app import db

MATH_SHAPES = [
    'circle', 'hexagon', 'pentagon', 
    'star', 'diamond', 'heart', 'cross', 'ellipse', 
    'rectangle', 'trapezoid', 'parallelogram', 'rhombus',
    'octagon', 'decagon', 'crescent', 'cube', 'oval', 
    'shield', 'cloud'
]

COLORS = [
    'red', 'blue', 'purple', 'orange', 'brown', 'cyan', 'magenta', 'teal', 
    'indigo', 'violet', 'maroon', 'navy', 'coral', 
    'gold', 'silver', 'gray', 'black'
]

task_names = {i: f"Zadanie {i}" for i in range(1, 51)}

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    result = db.Column(db.Integer, default=0)
    bonus_plus_one = db.Column(db.Boolean, default=False)
    bonus_plus_two = db.Column(db.Boolean, default=False)
    bonus_plus_three = db.Column(db.Boolean, default=False)
    task_done = db.Column(db.Boolean, default=False)
    color = db.Column(db.String(20), nullable=False, default='blue')
    shape = db.Column(db.String(20), nullable=False, default='circle')
    roll_disabled = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Player {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'result': self.result,
            'bonus_plus_one': self.bonus_plus_one,
            'bonus_plus_two': self.bonus_plus_two,
            'bonus_plus_three': self.bonus_plus_three,
            'task_done': self.task_done,
            'color': self.color,
            'shape': self.shape,
            'roll_disabled': self.roll_disabled
        }

class PlayerTask(db.Model):
    __tablename__ = 'player_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    task_id = db.Column(db.Integer, nullable=False)
    task_status = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, default=db.func.now())
    displayed = db.Column(db.Boolean, default=False)
    
    player = db.relationship('Player', backref=db.backref('tasks', lazy=True))
    
    def __repr__(self):
        return f'<PlayerTask {self.player_id} - Task {self.task_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'task_id': self.task_id,
            'task_status': self.task_status,
            'completed_at': self.completed_at,
            'displayed': self.displayed
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
    classroom_4th_grade = db.Column(db.String(50), default='Sala 4')
    classroom_5th_grade = db.Column(db.String(50), default='Sala 5')
    classroom_6th_grade = db.Column(db.String(50), default='Sala 6')
    classroom_7th_grade = db.Column(db.String(50), default='Sala 7')
    
    def __repr__(self):
        return f'<CorrectSentence {self.cell_number} - {self.correct_sentence}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'correct_sentence': self.correct_sentence,
            'cell_number': self.cell_number,
            'classroom_4th_grade': self.classroom_4th_grade,
            'classroom_5th_grade': self.classroom_5th_grade,
            'classroom_6th_grade': self.classroom_6th_grade,
            'classroom_7th_grade': self.classroom_7th_grade,
        }

class PlayerCode(db.Model):
    __tablename__ = 'player_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    sentence = db.Column(db.String(255), nullable=False)
    displayed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    player = db.relationship('Player', backref=db.backref('codes', lazy=True))
    
    def __repr__(self):
        return f'<PlayerCode {self.player_id} - Sentence {self.sentence}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'sentence': self.sentence,
            'displayed': self.displayed,
            'created_at': self.created_at
        }

class CorrectCode(db.Model):
    __tablename__ = 'correct_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(255), nullable=False)
    bonus_type = db.Column(db.String(255), nullable=False)
    sentence = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<CorrectCode {self.subject}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'subject': self.subject,
            'bonus_type': self.bonus_type,
            'sentence': self.sentence,
            'completed': self.completed
        }


class PlayerNotification(db.Model):
    __tablename__ = 'player_notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.now())
    
    player = db.relationship('Player', backref=db.backref('notifications', lazy=True))
    
    def __repr__(self):
        return f'<PlayerNotification {self.player_id} - {self.message}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'message': self.message,
            'timestamp': self.timestamp
        }