from flask import render_template, request, jsonify, redirect, url_for, flash
from app import app, db, socketio
from models import Player, PlayerTask, PlayerSentence, CorrectSentence, CorrectCode, PlayerCode, task_names
import random

@app.route('/')
def index():
    players = Player.query.order_by(Player.name).all()
    return render_template('index.html', players=players, task_names=task_names)

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
    if 'bonus_plus_one' in data:
        player.bonus_plus_one = data['bonus_plus_one']
    if 'bonus_plus_two' in data:
        player.bonus_plus_two = data['bonus_plus_two']
    if 'bonus_plus_three' in data:
        player.bonus_plus_three = data['bonus_plus_three']
    if 'task_done' in data:
        player.task_done = data['task_done']
    
    db.session.commit()
    return jsonify(player.to_dict())

@app.route('/api/roll/<int:player_id>', methods=['POST'])
def roll_dice(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.json
    roll_value = data.get('roll')
    player.result += roll_value
    db.session.commit()
    
    return jsonify({
        'player': player.to_dict(),
        'roll': roll_value
    })

@app.route('/api/activate_bonus/<int:player_id>', methods=['POST'])
def activate_bonus(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.json
    bonus_type = data.get('bonusType')

    if bonus_type == 'bonus_plus_one':
        player.result += 1
    elif bonus_type == 'bonus_plus_two':
        player.result += 2
    elif bonus_type == 'bonus_plus_three':
        player.result += 3
    else:
        return jsonify({'error': 'Invalid bonus type'}), 400

    db.session.commit()
    return jsonify({
        'message': f'{bonus_type} został aktywowany dla {player.name}',
        'new_result': player.result,
        'player': player.to_dict()
    })

@app.route('/api/players/latest', methods=['GET'])
def get_latest_players():
    players = Player.query.all()
    return jsonify([player.to_dict() for player in players])

@app.route('/reset', methods=['POST'])
def reset_game():
    players = Player.query.all()
    for player in players:
        player.result = 0
        player.bonus = None
        player.task_done = False
        player.bonus_plus_one = False
        player.bonus_plus_two = False
        player.bonus_plus_three = False
    PlayerTask.query.delete()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/zadania')
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
    
    player_task = PlayerTask(
        player_id=player_id, 
        task_id=task_id, 
        task_status=True
    )
    db.session.add(player_task)
    player.result += 1
    
    db.session.commit()
    
    notify_clients()
    
    return jsonify({
        'success': True,
        'player_name': player.name,
        'task_id': task_id
    })

@app.route('/get_recent_tasks', methods=['GET'])
def get_recent_tasks():
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
    
    recent_codes = db.session.query(PlayerCode, CorrectCode).\
        join(CorrectCode, PlayerCode.sentence == CorrectCode.sentence).\
        order_by(PlayerCode.created_at.desc()).all()
    
    for player_code, correct_code in recent_codes:
        player = Player.query.get(player_code.player_id)
        tasks.append({
            'player': {
                'name': player.name
            },
            'task_name': f"{player.name} poprawnie rozszyfrowała hasło i otrzymała {correct_code.bonus_type} do przodu.",
            'type': 'code',
            'timestamp': player_code.created_at
        })
    
    tasks = sorted(tasks, key=lambda x: x['timestamp'], reverse=True)[:1]
    return jsonify({'recent_tasks': tasks})

def notify_clients():
    tasks = get_recent_tasks().json['recent_tasks']
    socketio.emit('new_task', tasks)

@app.route('/submit_sentence', methods=['POST'])
def submit_sentence():
    player_id = request.form.get('player_id')
    sentence = request.form.get('sentence')
    
    if not player_id or not sentence:
        flash('Klasa oraz hasło jest wymagane.', 'error')
        return redirect(url_for('sentence_form'))
    
    player = Player.query.get_or_404(player_id)
    cell_number = player.result
    player_sentence = PlayerSentence(
        player_id=player_id,
        sentence=sentence
    )
    db.session.add(player_sentence)
    db.session.commit()
    
    correct_sentence = CorrectSentence.query.filter_by(cell_number=cell_number, correct_sentence=sentence).first()
    
    if correct_sentence:
        if correct_sentence.completed:
            flash('To hasło zostało już odgadnięte.', 'error')
        else:
            correct_sentence.completed = True
            db.session.commit()
            flash(f'Hasło poprawne. Pójdź do {correct_sentence.classroom}.', 'success')
    else:
        flash('Niepoprawne hasło.', 'error')
    
    return redirect(url_for('sentence_form'))

@app.route('/zatwierdz-haslo')
def sentence_form():
    players = Player.query.order_by(Player.name).all()
    return render_template('sentence_form.html', players=players)

@app.route('/get_cell_number/<int:player_id>')
def get_cell_number(player_id):
    player = Player.query.get(player_id)
    if player:
        return jsonify({'cell_number': player.result})
    return jsonify({'cell_number': None}), 404

@app.route('/submit_code', methods=['POST'])
def submit_code():
    player_id = request.form.get('player_id')
    code = request.form.get('code')
    
    if not player_id or not code:
        flash('Klasa oraz szyfr jest wymagany.', 'error')
        return redirect(url_for('code_form'))
    
    player = Player.query.get_or_404(player_id)
    new_player_code = PlayerCode(player_id=player_id, sentence=code)
    db.session.add(new_player_code)
    db.session.commit()
    
    correct_code = CorrectCode.query.filter_by(sentence=code).first()
    
    if correct_code:
        print(correct_code.bonus_type)
        # Update the player's bonus fields based on the bonus type
        if correct_code.bonus_type == '+1':
            player.bonus_plus_one = True
        elif correct_code.bonus_type == '+2':
            player.bonus_plus_two = True
        elif correct_code.bonus_type == '+3':
            player.bonus_plus_three = True
        
        db.session.commit()

        # Emit a bonus update event
        socketio.emit('bonus_update', {
            'player_id': player.id,
            'bonuses': {
                'bonus_plus_one': player.bonus_plus_one,
                'bonus_plus_two': player.bonus_plus_two,
                'bonus_plus_three': player.bonus_plus_three
            }
        })

        flash(f'Szyfr jest poprawny. Otrzymałeś {correct_code.bonus_type}.', 'success')
    else:
        flash('Szyfr jest niepoprawny. Spróbuj ponownie.', 'error')
    
    notify_clients()
    
    return redirect(url_for('code_form'))

@app.route('/zatwierdz-szyfr')
def code_form():
    players = Player.query.order_by(Player.name).all()
    subjects = CorrectCode.query.with_entities(CorrectCode.subject).distinct().all()
    return render_template('code_form.html', players=players, subjects=subjects)

if __name__ == '__main__':
    socketio.run(app)