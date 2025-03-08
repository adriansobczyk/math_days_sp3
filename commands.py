from app import app, db
from models import Player, CorrectSentence, CorrectCode, COLORS, MATH_SHAPES

@app.cli.command("init-db")
def init_db():
    db.drop_all()
    db.create_all()
    
    player_names = ['4a', '4b', '4c', '4d', '4e']
    used_shapes = set()
    
    for i, player_name in enumerate(player_names):
        if not Player.query.filter_by(name=player_name).first():
            color = COLORS[i % len(COLORS)]
            shape_index = i % len(MATH_SHAPES)
            
            # Find a unique shape if possible
            while MATH_SHAPES[shape_index] in used_shapes and len(used_shapes) < len(MATH_SHAPES):
                shape_index = (shape_index + 1) % len(MATH_SHAPES)
            
            shape = MATH_SHAPES[shape_index]
            used_shapes.add(shape)
            
            player = Player(
                name=player_name,
                color=color,
                shape=shape
            )
            db.session.add(player)
    
    db.session.commit()

    
    # Add sample data for CorrectSentence
    sample_sentences = [
        {"correct_sentence": "hasło 1", "cell_number": 1, "classroom": "Sala 1"},
        {"correct_sentence": "hasło 2", "cell_number": 2, "classroom": "Sala 2"},
        {"correct_sentence": "hasło 3", "cell_number": 3, "classroom": "Sala 3"},
        {"correct_sentence": "hasło 4", "cell_number": 4, "classroom": "Sala 4"},
        {"correct_sentence": "hasło 5", "cell_number": 5, "classroom": "Sala 5"},
        {"correct_sentence": "hasło 6", "cell_number": 6, "classroom": "Sala 6"}
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
        {"subject": "matematyka", "bonus_type": "+1", "sentence": "Kod 1"},
        {"subject": "biologia", "bonus_type": "+2", "sentence": "Kod 2"},
        {"subject": "fizyka", "bonus_type": "+3", "sentence": "Kod 3"}
    ]
    
    for code in sample_codes:
        correct_code = CorrectCode(
            subject=code["subject"],
            bonus_type=code["bonus_type"],
            sentence=code["sentence"]
        )
        db.session.add(correct_code)
    
    db.session.commit()