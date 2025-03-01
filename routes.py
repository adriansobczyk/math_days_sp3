from flask import render_template, request, jsonify, redirect, url_for
from app import app, db
from models import Player, PlayerTask, PlayerSentence, CorrectSentence, CorrectCode, PlayerCode, task_names
from datetime import datetime

@app.route('/')
def index():
    players = Player.query.order_by(Player.name).all()
    recent_tasks = PlayerTask.query.order_by(PlayerTask.completed_at.desc()).limit(3).all()
    message = request.args.get('message')
    message_type = request.args.get('message_type')
    return render_template('index.html', players=players, recent_tasks=recent_tasks, task_names=task_names, message=message, message_type=message_type)

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

@app.route('/tasks')
def tasks_view():
    players = Player.query.order_by(Player.name).all()
    recent_tasks = PlayerTask.query.order_by(PlayerTask.completed_at.desc()).limit(3).all()
    return render_template('tasks.html', players=players, task_names=task_names, recent_tasks=recent_tasks)

@app.route('/complete_task', methods=['POST'])
def complete_task():
    player_id = request.form.get('player_id')
    task_id = request.form.get('task_id')
    
    if not player_id or not task_id:
        return jsonify({'error': 'Player and task are required'}), 400
    
    player = Player.query.get_or_404(player_id)
    task_id = int(task_id)
    
    # Create a new PlayerTask record
    player_task = PlayerTask(
        player_id=player_id, 
        task_id=task_id, 
        task_status=True
    )
    db.session.add(player_task)
    
    # Update player's result (add 1 point per task)
    player.result += 1
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'player_name': player.name,
        'task_id': task_id
    })

@app.route('/get_recent_tasks', methods=['GET'])
def get_recent_tasks():
    # Get recent tasks
    recent_tasks = PlayerTask.query.order_by(PlayerTask.completed_at.desc()).all()
    tasks = []
    for task in recent_tasks:
        tasks.append({
            'player': {
                'name': task.player.name
            },
            'task_name': task_names[task.task_id],
            'type': 'task',
            'timestamp': task.completed_at
        })
    
    # Get recent correct code submissions
    recent_codes = db.session.query(PlayerCode, CorrectCode).\
        join(CorrectCode, PlayerCode.sentence == CorrectCode.sentence).\
        order_by(PlayerCode.created_at.desc()).all()
    
    for player_code, correct_code in recent_codes:
        player = Player.query.get(player_code.player_id)
        tasks.append({
            'player': {
                'name': player.name
            },
            'task_name': f"correctly encrypted the code. {player.name} can {correct_code.bonus_type}",
            'type': 'code',
            'timestamp': player_code.created_at
        })
    
    # Sort by timestamp (most recent first) and limit to 3
    tasks = sorted(tasks, key=lambda x: x['timestamp'], reverse=True)[:3]
    
    return jsonify({'recent_tasks': tasks})

@app.route('/submit_sentence', methods=['POST'])
def submit_sentence():
    player_id = request.form.get('player_id')
    cell_number = request.form.get('cell_number')
    sentence = request.form.get('sentence')
    
    if not player_id or not cell_number or not sentence:
        return redirect(url_for('sentence_form', message='Player, cell number, and sentence are required', message_type='error'))
    
    correct_sentence = CorrectSentence.query.filter_by(cell_number=cell_number, correct_sentence=sentence).first()
    
    if correct_sentence:
        player_sentence = PlayerSentence(
            player_id=player_id,
            sentence=sentence
        )
        db.session.add(player_sentence)
        db.session.commit()
        
        return redirect(url_for('sentence_form', message=f'Sentence correct. Please go to {correct_sentence.classroom}.', message_type='success'))
    else:
        return redirect(url_for('sentence_form', message='Incorrect sentence.', message_type='error'))

@app.route('/sentence_form')
def sentence_form():
    players = Player.query.order_by(Player.name).all()
    cell_numbers = CorrectSentence.query.with_entities(CorrectSentence.cell_number).distinct().all()
    message = request.args.get('message')
    message_type = request.args.get('message_type')
    return render_template('sentence_form.html', players=players, cell_numbers=cell_numbers, message=message, message_type=message_type)

@app.route('/submit_code', methods=['POST'])
def submit_code():
    player_id = request.form.get('player_id')
    code = request.form.get('code')
    
    if not player_id or not code:
        return redirect(url_for('code_form', message='Player and code are required', message_type='error'))
    
    # Create and save the PlayerCode record
    new_player_code = PlayerCode(player_id=player_id, sentence=code)
    db.session.add(new_player_code)
    db.session.commit()
    
    correct_code = CorrectCode.query.filter_by(sentence=code).first()
    
    if correct_code:
        # Show success message on current page
        player = Player.query.get(player_id)
        message = f'Player {player.name} correctly encrypted the code. Player {player.name} can {correct_code.bonus_type}.'
        return redirect(url_for('code_form', message=message, message_type='success'))
    else:
        return redirect(url_for('code_form', message='Code is incorrect. Try again.', message_type='error'))
    
@app.route('/code_form')
def code_form():
    players = Player.query.order_by(Player.name).all()
    subjects = CorrectCode.query.with_entities(CorrectCode.subject).distinct().all()
    message = request.args.get('message')
    message_type = request.args.get('message_type')
    return render_template('code_form.html', players=players, subjects=subjects, message=message, message_type=message_type)