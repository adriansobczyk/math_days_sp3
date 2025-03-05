from flask_app import app, db
from models import Player, CorrectSentence, CorrectCode, COLORS, MATH_SHAPES

@app.cli.command("init-db")
def init_db():
    db.drop_all()
    db.create_all()
    
    for i in range(1, 9):
        player_name = f'Klasa {i}'
        if not Player.query.filter_by(name=player_name).first():
            player = Player(
                name=player_name,
                color=COLORS[(i - 1) % len(COLORS)],
                shape=MATH_SHAPES[(i - 1) % len(MATH_SHAPES)]
            )
            db.session.add(player)
    
    db.session.commit()
    
    # Add sample data for CorrectSentence
    sample_sentences = [
        {"correct_sentence": "This is sentence 1", "cell_number": 1, "classroom": "Room A"},
        {"correct_sentence": "This is sentence 2", "cell_number": 2, "classroom": "Room B"},
        {"correct_sentence": "This is sentence 3", "cell_number": 3, "classroom": "Room C"}
    ]
    
    for sentence in sample_sentences:
        correct_sentence = CorrectSentence(
            correct_sentence=sentence["correct_sentence"],
            cell_number=sentence["cell_number"],
            classroom=sentence["classroom"]
        )
        db.session.add(correct_sentence)
    
    db.session.commit()
    
    sample_codes = [
        {"subject": "Math", "bonus_type": "get extra points", "sentence": "Math code 1"},
        {"subject": "Science", "bonus_type": "skip a task", "sentence": "Science code 2"},
        {"subject": "History", "bonus_type": "get a hint", "sentence": "History code 3"}
    ]
    
    for code in sample_codes:
        correct_code = CorrectCode(
            subject=code["subject"],
            bonus_type=code["bonus_type"],
            sentence=code["sentence"]
        )
        db.session.add(correct_code)
    
    db.session.commit()