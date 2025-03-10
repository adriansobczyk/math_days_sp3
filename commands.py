from app import app, db
from models import Player, CorrectSentence, CorrectCode, COLORS, MATH_SHAPES
import pandas as pd

@app.cli.command("init-db")
def init_db():
    db.drop_all()
    db.create_all()
    
    # Load data from Excel file
    excel_file = 'init_db.xlsx'
    sentences_df = pd.read_excel(excel_file, sheet_name='sentences')
    codes_df = pd.read_excel(excel_file, sheet_name='codes')
    players_df = pd.read_excel(excel_file, sheet_name='players')
    
    # Add players
    used_shapes = set()
    for i, row in players_df.iterrows():
        player_name = row['name']
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
    for _, row in sentences_df.iterrows():
        correct_sentence = CorrectSentence(
            correct_sentence=row['correct_sentence'],
            cell_number=row['cell_number'],
            classroom_4th_grade=row['classroom_4th_grade'],
            classroom_5th_grade=row['classroom_5th_grade'],
            classroom_6th_grade=row['classroom_6th_grade'],
            classroom_7th_grade=row['classroom_7th_grade']
        )
        db.session.add(correct_sentence)
    
    db.session.commit()
    
    # Add sample data for CorrectCode
    for _, row in codes_df.iterrows():
        correct_code = CorrectCode(
            subject=row['subject'],
            bonus_type='+' + str(row['bonus_type']),
            sentence=row['code']
        )
        db.session.add(correct_code)
    
    db.session.commit()